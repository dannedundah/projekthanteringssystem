import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYqBOra2wDjyPweyBGnkVMANsvLOx9pps",
  authDomain: "projekthanteringsystem.firebaseapp.com",
  projectId: "projekthanteringsystem",
  storageBucket: "projekthanteringsystem.appspot.com",
  messagingSenderId: "87207954816",
  appId: "1:87207954816:web:167659270c0d6eee901965",
  measurementId: "G-8HMD30CFYS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { 
  db, 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  addDoc, 
  getDoc, 
  query, 
  where, 
  storage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
};
