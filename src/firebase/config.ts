
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjFFXQzxUWD-OiC25bLYvNebIecpe9Yeo",
  authDomain: "job-board-90b32.firebaseapp.com",
  projectId: "job-board-90b32",
  storageBucket: "job-board-90b32.firebasestorage.app",
  messagingSenderId: "539604806450",
  appId: "1:539604806450:web:e215621aab90961742c52b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
