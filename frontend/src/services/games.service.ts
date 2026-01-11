// Games Service - CRUD operations for games
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Game } from 'shared';

/**
 * Create a new game
 */
export async function createGame(
  name: string,
  description: string | undefined,
  gmId: string
): Promise<string> {
  const gameData = {
    name,
    description: description || '',
    gmId,
    playerIds: [gmId], // GM is automatically a player
    isPersonal: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'games'), gameData);

  // Update with ID
  await updateDoc(doc(db, 'games', docRef.id), { id: docRef.id });

  return docRef.id;
}

/**
 * Get a game by ID
 */
export async function getGame(gameId: string): Promise<Game | null> {
  const gameDoc = await getDoc(doc(db, 'games', gameId));

  if (!gameDoc.exists()) return null;

  return gameDoc.data() as Game;
}

/**
 * Get all games where user is GM or player
 */
export async function getUserGames(userId: string): Promise<Game[]> {
  const gamesRef = collection(db, 'games');

  // Query games where user is GM
  const gmQuery = query(gamesRef, where('gmId', '==', userId));
  const gmSnapshot = await getDocs(gmQuery);

  // Query games where user is player
  const playerQuery = query(gamesRef, where('playerIds', 'array-contains', userId));
  const playerSnapshot = await getDocs(playerQuery);

  // Combine results (avoiding duplicates)
  const gameIds = new Set<string>();
  const games: Game[] = [];

  gmSnapshot.forEach((doc) => {
    if (!gameIds.has(doc.id)) {
      gameIds.add(doc.id);
      games.push(doc.data() as Game);
    }
  });

  playerSnapshot.forEach((doc) => {
    if (!gameIds.has(doc.id)) {
      gameIds.add(doc.id);
      games.push(doc.data() as Game);
    }
  });

  // Sort by updatedAt (most recent first)
  games.sort((a, b) => {
    const aTime = (a.updatedAt as Timestamp).toMillis();
    const bTime = (b.updatedAt as Timestamp).toMillis();
    return bTime - aTime;
  });

  return games;
}

/**
 * Subscribe to user's games in real-time
 */
export function subscribeToUserGames(
  userId: string,
  callback: (games: Game[]) => void
): Unsubscribe {
  const gamesRef = collection(db, 'games');

  // Subscribe to games where user is GM or player
  const gmQuery = query(gamesRef, where('gmId', '==', userId));
  const playerQuery = query(gamesRef, where('playerIds', 'array-contains', userId));

  let gmGames: Game[] = [];
  let playerGames: Game[] = [];

  const updateGames = () => {
    const gameIds = new Set<string>();
    const allGames: Game[] = [];

    [...gmGames, ...playerGames].forEach((game) => {
      if (!gameIds.has(game.id)) {
        gameIds.add(game.id);
        allGames.push(game);
      }
    });

    // Sort by updatedAt
    allGames.sort((a, b) => {
      const aTime = (a.updatedAt as Timestamp).toMillis();
      const bTime = (b.updatedAt as Timestamp).toMillis();
      return bTime - aTime;
    });

    callback(allGames);
  };

  const unsubGm = onSnapshot(
    gmQuery,
    (snapshot) => {
      gmGames = snapshot.docs.map((doc) => doc.data() as Game);
      console.log('GM games:', gmGames);
      updateGames();
    },
    (error) => {
      console.error('Error in GM games subscription:', error);
    }
  );

  const unsubPlayer = onSnapshot(
    playerQuery,
    (snapshot) => {
      playerGames = snapshot.docs.map((doc) => doc.data() as Game);
      console.log('Player games:', playerGames);
      updateGames();
    },
    (error) => {
      console.error('Error in player games subscription:', error);
    }
  );

  // Return combined unsubscribe function
  return () => {
    unsubGm();
    unsubPlayer();
  };
}

/**
 * Update game details
 */
export async function updateGame(
  gameId: string,
  updates: Partial<Pick<Game, 'name' | 'description'>>
): Promise<void> {
  await updateDoc(doc(db, 'games', gameId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Add player to game
 */
export async function addPlayerToGame(gameId: string, playerId: string): Promise<void> {
  const gameDoc = await getDoc(doc(db, 'games', gameId));

  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }

  const game = gameDoc.data() as Game;

  if (game.playerIds.includes(playerId)) {
    throw new Error('Player already in game');
  }

  await updateDoc(doc(db, 'games', gameId), {
    playerIds: [...game.playerIds, playerId],
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove player from game
 */
export async function removePlayerFromGame(gameId: string, playerId: string): Promise<void> {
  const gameDoc = await getDoc(doc(db, 'games', gameId));

  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }

  const game = gameDoc.data() as Game;

  if (game.gmId === playerId) {
    throw new Error('Cannot remove GM from game');
  }

  await updateDoc(doc(db, 'games', gameId), {
    playerIds: game.playerIds.filter((id) => id !== playerId),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete game (only GM can delete, and only if not personal)
 */
export async function deleteGame(gameId: string, userId: string): Promise<void> {
  const gameDoc = await getDoc(doc(db, 'games', gameId));

  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }

  const game = gameDoc.data() as Game;

  if (game.gmId !== userId) {
    throw new Error('Only GM can delete game');
  }

  if (game.isPersonal) {
    throw new Error('Cannot delete personal game');
  }

  await deleteDoc(doc(db, 'games', gameId));
}

/**
 * Check if user is GM of a game
 */
export function isGameMaster(game: Game, userId: string): boolean {
  return game.gmId === userId;
}

/**
 * Check if user is player in a game
 */
export function isPlayer(game: Game, userId: string): boolean {
  return game.playerIds.includes(userId);
}
