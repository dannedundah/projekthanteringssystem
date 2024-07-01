import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

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

export { db, collection, addDoc, getDocs, updateDoc, doc, storage, ref, uploadBytes, getDownloadURL };
