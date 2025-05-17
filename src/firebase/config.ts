
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjFFXQzxUWD-OiC25bLYvNebIecpe9Yeo",
  authDomain: "job-board-90b32.firebaseapp.com",
  projectId: "job-board-90b32",
  storageBucket: "job-board-90b32.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "539604806450",
  appId: "1:539604806450:web:e215621aab90961742c52b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence when possible
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support all of the features required for persistence
      console.log('Persistence not supported by this browser');
    }
  });
} catch (error) {
  console.log('Error enabling persistence:', error);
}

export default app;
