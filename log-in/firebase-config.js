import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWmwlu0WvS9khBbXx0zr7hZ36r5u3Q0pU",
  authDomain: "labyrinth-of-minos.firebaseapp.com",
  databaseURL: "https://labyrinth-of-minos-default-rtdb.firebaseio.com",
  projectId: "labyrinth-of-minos",
  storageBucket: "labyrinth-of-minos.firebasestorage.app",
  messagingSenderId: "331593986881",
  appId: "1:331593986881:web:5c1aa84067d2f3bd0fa7c0",
  measurementId: "G-22R4Y3RXH5",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
