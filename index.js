import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-project-btn').addEventListener('click', () => navigateTo('läggatillprojekt.html'));
    document.getElementById('planning-btn').addEventListener('click', () => navigateTo('planering.html'));
    document.getElementById('view-schedule-btn').addEventListener('click', () => navigateTo('se-schema.html'));
    document.getElementById('status-btn').addEventListener('click', () => navigateTo('status.html'));
    document.getElementById('planning-total-btn').addEventListener('click', () => navigateTo('planeringtotal.html'));

    // Auth state observer
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User is signed in:', user);
        } else {
            console.log('No user is signed in.');
            window.location.href = 'login.html';
        }
    });
});

function navigateTo(page) {
    window.location.href = page;
}
