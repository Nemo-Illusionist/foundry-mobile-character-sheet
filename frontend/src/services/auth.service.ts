// Authentication Service
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile,
} from 'firebase/auth';
import {doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore';
import {auth, db} from './firebase';
import type {User} from 'shared';

/**
 * Register a new user
 */
export async function register(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    console.log('🔐 Starting registration for:', email);

    try {
        // Create Firebase Auth user
        console.log('📝 Step 1: Creating Firebase Auth user...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        console.log('✅ Firebase Auth user created:', firebaseUser.uid);

        // Update profile with display name
        console.log('📝 Step 2: Updating profile with display name...');
        console.log('displayName value:', displayName, 'type:', typeof displayName);
        await updateProfile(firebaseUser, {displayName});
        console.log('✅ Profile updated');
        console.log('firebaseUser.photoURL:', firebaseUser.photoURL, 'type:', typeof firebaseUser.photoURL);

        // Wait for auth token to propagate
        console.log('⏳ Waiting for auth token...');
        const idToken = await firebaseUser.getIdToken(true);
        console.log('✅ Auth token obtained:', idToken ? 'present' : 'missing');

        // Verify current auth state
        const currentUser = auth.currentUser;
        console.log('👤 Current auth user:', {
            uid: currentUser?.uid,
            matches: currentUser?.uid === firebaseUser.uid
        });

        // Create user document in Firestore
        console.log('📝 Step 3: Creating user document in Firestore...');

        // Build userData without undefined values
        const userData: Record<string, any> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!.toLowerCase(),
            displayName,
            createdAt: serverTimestamp(),
        };

        // Only add photoURL if it exists and is not null/undefined
        if (firebaseUser.photoURL != null) {
            userData.photoURL = firebaseUser.photoURL;
        }

        console.log('photoURL check:', {
            raw: firebaseUser.photoURL,
            type: typeof firebaseUser.photoURL,
            isNull: firebaseUser.photoURL === null,
            isUndefined: firebaseUser.photoURL === undefined,
            willInclude: firebaseUser.photoURL != null
        });

        console.log('📄 User data to write:', {
            path: `users/${firebaseUser.uid}`,
            data: { ...userData, createdAt: '<serverTimestamp>' },
            hasPhotoURL: 'photoURL' in userData,
            photoURLValue: userData.photoURL
        });

        try {
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            console.log('✅ User document created in Firestore');

            // Verify it was written
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                console.log('✅ User document verified:', userDocSnap.data());
            } else {
                console.warn('⚠️  User document NOT found after write!');
            }
        } catch (userError) {
            console.error('❌ Failed to create user document:', userError);
            console.error('Error code:', (userError as any).code);
            console.error('Error message:', (userError as any).message);
            throw userError;
        }

        console.log('🎉 Registration completed successfully!');
        return firebaseUser;
    } catch (error) {
        console.error('❌ Registration failed:', error);
        throw error;
    }
}

/**
 * Sign in existing user
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

/**
 * Get current user's data from Firestore
 */
export async function getCurrentUserData(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as User;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
}
