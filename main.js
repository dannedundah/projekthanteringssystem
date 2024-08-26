import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYqBOra2wDjyPweyBGnkVMANsvLOx9pps",
  authDomain: "projekthanteringsystem.firebaseapp.com",
  projectId: "projekthanteringsystem",
  storageBucket: "projekthanteringsystem.appspot.com",
  messagingSenderId: "87207954816",
  appId: "1:87207954816:web:167659270c0d6eee901965",
  measurementId: "G-8HMD30CFYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check authentication state and fetch user data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData);

        // Kontrollera om användaren är "daniel@delidel.se" och se till att han alltid är admin
        if (user.email === 'daniel@delidel.se') {
          if (userData.role !== 'Admin') {
            // Uppdatera rollen till Admin om det inte redan är Admin
            await updateDoc(userRef, { role: 'Admin' });
            console.log("Role for daniel@delidel.se updated to Admin.");
          }
          document.getElementById('admin-module').style.display = 'block';
        } else if (userData.role === 'Admin') {
          document.getElementById('admin-module').style.display = 'block';
        } else {
          alert("Du har inte behörighet att se denna sida.");
          window.location.href = 'login.html';
        }
      } else {
        console.log("No user document found.");
        window.location.href = 'login.html';
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      window.location.href = 'login.html';
    }
  } else {
    console.log("No user is signed in.");
    window.location.href = 'login.html';
  }
});
