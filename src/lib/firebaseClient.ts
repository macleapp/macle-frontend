// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Cliente Firebase para React Native (Auth con persistencia en AsyncStorage)

import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  authDomain: "macle-7d991.firebaseapp.com",
  projectId: "macle-7d991",
  storageBucket: "macle-7d991.firebasestorage.app",
  messagingSenderId: "491288182738",
  appId: "1:491288182738:web:f58696cff3b98f53cb920b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db = getFirestore(app);