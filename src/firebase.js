import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAvHCSLdEurUxuMGtD5YjmB7HiOGagSqNA",
    authDomain: "gestion-inmuebles-app-18c61.firebaseapp.com",
    projectId: "gestion-inmuebles-app-18c61",
    storageBucket: "gestion-inmuebles-app-18c61.firebasestorage.app",
    messagingSenderId: "402300091171",
    appId: "1:402300091171:web:a3810f5c2c964a370d6a96"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);