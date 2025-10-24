import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVoifybADa59HT30qRvcdkeNVWuDx9cIA",
  authDomain: "menulatronera.firebaseapp.com",
  projectId: "menulatronera",
  storageBucket: "menulatronera.firebasestorage.app",
  messagingSenderId: "463087743255",
  appId: "1:463087743255:web:0a663d75f50ca00dcc8752"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
