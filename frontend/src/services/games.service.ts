// Games Service - CRUD operations for games
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
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
 * Create a personal game for a new user
 * Game ID is deterministic: personal_{userId}
 */
export async function createPersonalGame(userId: string): Promise<void> {
  const gameId = `personal_${userId}`;

  const gameData = {
    id: gameId,
    name: `Personal Game`,
    description: 'Your private game for personal characters',
    gmId: userId,
    playerIds: [userId],
    isPersonal: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  console.log('📝 Creating personal game:', {
    gameId,
    userId,
    gameData: { ...gameData, createdAt: '<serverTimestamp>', updatedAt: '<serverTimestamp>' }
  });

  await setDoc(doc(db, 'games', gameId), gameData);

  console.log('✅ Personal game created successfully');
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
 * Subscribe to a single game in real-time
 */
export function subscribeToGame(
  gameId: string,
  callback: (game: Game | null) => void
): Unsubscribe {
  const gameRef = doc(db, 'games', gameId);

  console.log('📡 Setting up game subscription for:', gameId);

  return onSnapshot(
    gameRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const gameData = snapshot.data() as Game;
        console.log('✅ Game snapshot received:', {
          id: gameData.id,
          name: gameData.name,
          gmId: gameData.gmId,
          playerIds: gameData.playerIds
        });
        callback(gameData);
      } else {
        console.warn('⚠️ Game document does not exist:', gameId);
        callback(null);
      }
    },
    (error) => {
      console.error('❌ Error subscribing to game:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      callback(null);
    }
  );
}

/**
 * Subscribe to user's games in real-time
 */
export function subscribeToUserGames(
  userId: string,
  callback: (games: Game[]) => void
): Unsubscribe {
  const gamesRef = collection(db, 'games');

  console.log('🔍 Setting up subscriptions for userId:', userId);

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
      console.log('📊 GM query snapshot:', {
        size: snapshot.size,
        empty: snapshot.empty,
        docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
      });
      gmGames = snapshot.docs.map((doc) => doc.data() as Game);
      console.log('GM games:', gmGames);
      updateGames();
    },
    (error) => {
      console.error('❌ Error in GM games subscription:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  );

  const unsubPlayer = onSnapshot(
    playerQuery,
    (snapshot) => {
      console.log('📊 Player query snapshot:', {
        size: snapshot.size,
        empty: snapshot.empty,
        docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
      });
      playerGames = snapshot.docs.map((doc) => doc.data() as Game);
      console.log('Player games:', playerGames);
      updateGames();
    },
    (error) => {
      console.error('❌ Error in player games subscription:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
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
  console.log('➕ Adding player to game:', { gameId, playerId });

  const gameDoc = await getDoc(doc(db, 'games', gameId));

  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }

  const game = gameDoc.data() as Game;

  console.log('Current game state:', {
    name: game.name,
    gmId: game.gmId,
    currentPlayers: game.playerIds
  });

  if (game.playerIds.includes(playerId)) {
    throw new Error('Player already in game');
  }

  const newPlayerIds = [...game.playerIds, playerId];
  console.log('Updating playerIds to:', newPlayerIds);

  await updateDoc(doc(db, 'games', gameId), {
    playerIds: newPlayerIds,
    updatedAt: serverTimestamp(),
  });

  console.log('✅ Player added successfully');
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
