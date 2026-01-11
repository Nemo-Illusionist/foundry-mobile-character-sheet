import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function: Create personal game for new user
 * Triggers when a new user is created via Firebase Auth
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = user.email || '';
  const displayName = user.displayName || email.split('@')[0];

  console.log(`Creating personal game for user: ${uid}`);

  try {
    // Create user document
    const userRef = db.collection('users').doc(uid);

    // Create personal game
    const gameRef = db.collection('games').doc();
    const gameId = gameRef.id;

    await db.runTransaction(async (transaction) => {
      // Create game document
      transaction.set(gameRef, {
        id: gameId,
        name: `${displayName}'s Personal Game`,
        description: 'Your personal game for storing characters and items',
        gmId: uid,
        playerIds: [uid],
        isPersonal: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create user document with reference to personal game
      transaction.set(userRef, {
        uid,
        email,
        displayName,
        photoURL: user.photoURL || null,
        personalGameId: gameId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    console.log(`✓ Personal game created for user ${uid}: ${gameId}`);
  } catch (error) {
    console.error(`Error creating personal game for user ${uid}:`, error);
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
