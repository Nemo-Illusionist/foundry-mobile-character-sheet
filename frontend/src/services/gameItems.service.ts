// Game Items Service - CRUD operations for shared game items (maps, notes, images)
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { GameItem, GameItemType } from 'shared';

/**
 * Create a new game item
 */
export async function createGameItem(
  gameId: string,
  name: string,
  type: GameItemType,
  description: string | undefined,
  imageUrl: string | undefined,
  visibleTo: 'all' | 'gm',
  createdBy: string
): Promise<string> {
  const itemData = {
    gameId,
    name,
    type,
    description: description || '',
    imageUrl: imageUrl || '',
    visibleTo,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, 'games', gameId, 'gameItems'),
    itemData
  );

  // Update with ID
  await updateDoc(doc(db, 'games', gameId, 'gameItems', docRef.id), {
    id: docRef.id,
  });

  return docRef.id;
}

/**
 * Get a game item by ID
 */
export async function getGameItem(
  gameId: string,
  itemId: string
): Promise<GameItem | null> {
  const itemDoc = await getDoc(
    doc(db, 'games', gameId, 'gameItems', itemId)
  );

  if (!itemDoc.exists()) return null;

  return itemDoc.data() as GameItem;
}

/**
 * Get all game items for a game
 */
export async function getGameItems(gameId: string): Promise<GameItem[]> {
  const itemsRef = collection(db, 'games', gameId, 'gameItems');
  const q = query(itemsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data() as GameItem);
}

/**
 * Subscribe to game items in real-time
 */
export function subscribeToGameItems(
  gameId: string,
  callback: (items: GameItem[]) => void
): Unsubscribe {
  const itemsRef = collection(db, 'games', gameId, 'gameItems');
  const q = query(itemsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data() as GameItem);
      callback(items);
    },
    (error) => {
      console.error('Error subscribing to game items:', error);
      callback([]);
    }
  );
}

/**
 * Update game item
 */
export async function updateGameItem(
  gameId: string,
  itemId: string,
  updates: Partial<
    Pick<GameItem, 'name' | 'type' | 'description' | 'imageUrl' | 'visibleTo'>
  >
): Promise<void> {
  await updateDoc(doc(db, 'games', gameId, 'gameItems', itemId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete game item
 */
export async function deleteGameItem(
  gameId: string,
  itemId: string
): Promise<void> {
  await deleteDoc(doc(db, 'games', gameId, 'gameItems', itemId));
}

/**
 * Filter game items by visibility
 * Players see only 'all' items, GM sees everything
 */
export function filterGameItemsByVisibility(
  items: GameItem[],
  isGM: boolean
): GameItem[] {
  if (isGM) {
    return items;
  }

  return items.filter((item) => item.visibleTo === 'all');
}
