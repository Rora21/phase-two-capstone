// app/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCnTzoF72RoZyZuU3AbxemZvzOa_FHAjPg",
  authDomain: "phase-two-capstone.firebaseapp.com",
  projectId: "phase-two-capstone",
  storageBucket: "phase-two-capstone.firebasestorage.app.com",
  messagingSenderId: "602748338308",
  appId: "1:602748338308:web:2729970d1254e54260c2d1",
  measurementId: "G-D8FVGNEP58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

// Auth 🟦
export const auth = getAuth(app);
