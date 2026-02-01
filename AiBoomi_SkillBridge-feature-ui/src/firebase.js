// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAZP8wFvF88YZemER1uJSgPCIVq4T3VFA",
  authDomain: "aiboomi-skillbridge.firebaseapp.com",
  projectId: "aiboomi-skillbridge",
  storageBucket: "aiboomi-skillbridge.firebasestorage.app",
  messagingSenderId: "341308734188",
  appId: "1:341308734188:web:ba057756f015b77874c3c9",
  measurementId: "G-5LJX7KLQJ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics;

// Initialize analytics only in browser
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Export services
export { app, auth, db, storage, analytics };

// Debug helper
export const testFirestoreConnection = async () => {
  try {
    console.log('🔍 Testing Firestore connection...');
    
    // Test connection by getting a dummy document
    const testRef = collection(db, '_test');
    const snapshot = await getDocs(testRef);
    
    console.log('✅ Firestore is ready and connected!');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
};

export default { app, auth, db, storage, analytics };