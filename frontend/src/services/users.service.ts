// Users Service - User management and lookups
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'shared';

/**
 * Get user by UID
 */
export async function getUser(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) return null;

  return userDoc.data() as User;
}

/**
 * Get users by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const searchEmail = email.trim().toLowerCase();
  console.log('Firestore instance:', db);
  console.log('Firestore settings:', db.toJSON ? db.toJSON() : 'N/A');
  console.log('Searching for user with email:', searchEmail);

  // Try with query first
  try {
    const q = query(collection(db, 'users'), where('email', '==', searchEmail));
    const snapshot = await getDocs(q);

    console.log('Query found users:', snapshot.size);

    if (!snapshot.empty) {
      const user = snapshot.docs[0].data() as User;
      console.log('Found user via query:', user);
      return user;
    }
  } catch (error) {
    console.error('Query failed:', error);
  }

  // Fallback: Get all users and filter client-side
  console.log('Trying fallback: getting all users...');
  try {
    const allUsersSnapshot = await getDocs(collection(db, 'users'));
    console.log('Total users in collection:', allUsersSnapshot.size);

    for (const doc of allUsersSnapshot.docs) {
      const userData = doc.data() as User;
      console.log('Checking user:', userData.email);
      if (userData.email.toLowerCase() === searchEmail) {
        console.log('Found user via fallback:', userData);
        return userData;
      }
    }
  } catch (error) {
    console.error('Fallback failed:', error);
  }

  console.log('User not found');
  return null;
}

/**
 * Get multiple users by UIDs
 */
export async function getUsers(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return [];

  const users: User[] = [];

  // Firestore doesn't support 'in' queries with more than 10 items
  // So we need to batch the requests
  const batches = [];
  for (let i = 0; i < userIds.length; i += 10) {
    batches.push(userIds.slice(i, i + 10));
  }

  for (const batch of batches) {
    const promises = batch.map((userId) => getUser(userId));
    const batchUsers = await Promise.all(promises);
    users.push(...batchUsers.filter((u): u is User => u !== null));
  }

  return users;
}
