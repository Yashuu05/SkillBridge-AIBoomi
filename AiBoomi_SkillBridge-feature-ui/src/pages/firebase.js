// src/pages/firebase.js - Local config
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBAZP8wFvF88YZemER1uJSgPCIVq4T3VFA",
  authDomain: "aiboomi-skillbridge.firebaseapp.com",
  projectId: "aiboomi-skillbridge",
  storageBucket: "aiboomi-skillbridge.firebasestorage.app",
  messagingSenderId: "341308734188",
  appId: "1:341308734188:web:ba057756f015b77874c3c9",
  measurementId: "G-5LJX7KLQJ7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default { db };