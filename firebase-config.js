// ==========================================
//  🔥 Firebase Configuration - Multi Store
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDs8md9FhjnmmIf43qd7VRr74RKd8uMsdM",
  authDomain: "my-store-24808.firebaseapp.com",
  projectId: "my-store-24808",
  storageBucket: "my-store-24808.firebasestorage.app",
  messagingSenderId: "330077789003",
  appId: "1:330077789003:web:76cda32150ea3621b7e6ce"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { 
  db, 
  auth, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};