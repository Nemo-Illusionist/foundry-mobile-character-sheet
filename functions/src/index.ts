import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function: Create personal game for new user
 * Triggers when a new user is created via Firebase Auth
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = (user.email || '').toLowerCase(); // Always store email in lowercase
  const displayName = user.displayName || email.split('@')[0];

  console.log(`Creating user document and personal game for: ${uid}`);

  try {
    // Personal game ID is deterministic
    const gameId = `personal_${uid}`;

    await db.runTransaction(async (transaction) => {
      // Create user document
      transaction.set(db.collection('users').doc(uid), {
        uid,
        email,
        displayName,
        photoURL: user.photoURL || null,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Create personal game with deterministic ID
      transaction.set(db.collection('games').doc(gameId), {
        id: gameId,
        name: `Personal Game`,
        description: 'Your personal game for storing characters and items',
        gmId: uid,
        playerIds: [uid],
        isPersonal: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    console.log(`✓ User and personal game created: ${uid}`);
  } catch (error) {
    console.error(`Error creating user and personal game for ${uid}:`, error);
    throw error;
  }
});

/**
 * Cloud Function: Cleanup user data on account deletion
 * Triggers when a user account is deleted
 */
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;

  console.log(`Cleaning up data for deleted user: ${uid}`);

  try {
    const batch = db.batch();

    // Get user's personal game
    const userDoc = await db.collection('users').doc(uid).get();
    const personalGameId = userDoc.data()?.personalGameId;

    // Delete user document
    batch.delete(db.collection('users').doc(uid));

    // Delete personal game and its subcollections
    if (personalGameId) {
      batch.delete(db.collection('games').doc(personalGameId));

      // Note: Subcollections (characters, knowledge base) need separate cleanup
      // In production, consider using a recursive delete function
    }

    await batch.commit();

    console.log(`✓ Cleaned up data for user ${uid}`);
  } catch (error) {
    console.error(`Error cleaning up data for user ${uid}:`, error);
  }
});
