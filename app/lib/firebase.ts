// app/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if config is valid and not already initialized
let app;
if (typeof window !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} else {
  app = null;
}

// Firestore
export const db = app ? getFirestore(app) : null;

// Storage
export const storage = app ? getStorage(app) : null;

// Auth
export const auth = app ? getAuth(app) : null;
