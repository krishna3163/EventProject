import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAuB36DKZCF15-tI5mYt6EppLNoTLlb1k4",
    authDomain: "eventproject-main.firebaseapp.com",
    projectId: "eventproject-main",
    storageBucket: "eventproject-main.firebasestorage.app",
    messagingSenderId: "101957720039",
    appId: "1:101957720039:web:187623dba1abecde254f42",
    measurementId: "G-89RGVWZZ0H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
