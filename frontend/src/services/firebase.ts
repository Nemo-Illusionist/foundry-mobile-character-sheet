// Firebase Initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig, useEmulators } from '../config/firebase.config';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  useEmulators,
  isDev: import.meta.env.DEV,
  viteUseEmulators: import.meta.env.VITE_USE_EMULATORS
});

// Connect to emulators in development
if (useEmulators) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Firebase Emulators connected successfully');
    console.log('  - Auth: http://localhost:9099');
    console.log('  - Firestore: localhost:8080');
  } catch (error) {
    console.error('❌ Emulator connection FAILED:', error);
  }
} else {
  console.log('🌐 Using PRODUCTION Firebase (emulators disabled)');
}
