// app/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCnTzoF72RoZyZuU3AbxemZvzOa_FHAjPg",
  authDomain: "phase-two-capstone.firebaseapp.com",
  projectId: "phase-two-capstone",
  storageBucket: "phase-two-capstone.firebasestorage.app",
  messagingSenderId: "602748338308",
  appId: "1:602748338308:web:2729970d1254e54260c2d1",
  measurementId: "G-D8FVGNEP58"
};

const app = initializeApp(firebaseConfig);

let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

export { app, analytics };
