import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBcln6f9OUSb4UwS27fGNOHl6xuJUs8PFA",
  authDomain: "agriai-6fe1d.firebaseapp.com",
  projectId: "agriai-6fe1d",
  storageBucket: "agriai-6fe1d.appspot.com",
  messagingSenderId: "136623515349",
  appId: "1:136623515349:web:dae27c6162cf1b1df6245c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };