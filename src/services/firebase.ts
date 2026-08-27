import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAXRtu206Km2VjUyjBwh7edYNq9MadMxs",
  authDomain: "huscs-caa31.firebaseapp.com",
  projectId: "huscs-caa31",
  storageBucket: "huscs-caa31.firebasestorage.app",
  messagingSenderId: "833817701413",
  appId: "1:833817701413:web:5496ad193c51b6e17ee3cc",
  measurementId: "G-8NZKYRQ2NS"
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
