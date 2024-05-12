import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-3ad19.firebaseapp.com",
  projectId: "reactchat-3ad19",
  storageBucket: "reactchat-3ad19.appspot.com",
  messagingSenderId: "1078266284978",
  appId: "1:1078266284978:web:d5bcf3263b4ab34350f2ab"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()