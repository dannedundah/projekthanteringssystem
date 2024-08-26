import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYqBOra2wDjyPweyBGnkVMANsvLOx9pps",
  authDomain: "projekthanteringsystem.firebaseapp.com",
  projectId: "projekthanteringsystem",
  storageBucket: "projekthanteringsystem.appspot.com",
  messagingSenderId: "87207954816",
  appId: "1:87207954816:web:167659270c0d6eee901965",
  measurementId: "G-8HMD30CFYS"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp(); // Use the already initialized app
}

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    const addProjectBtn = document.getElementById('add-project-btn');
    const planningBtn = document.getElementById('planning-btn');
    const viewScheduleBtn = document.getElementById('view-schedule-btn');
    const statusBtn = document.getElementById('status-btn');
    const planningTotalBtn = document.getElementById('planning-total-btn');
    const timeReportingBtn = document.getElementById('time-reporting-btn');
    const exportTimeReportBtn = document.getElementById('export-time-report-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => navigateTo('läggatillprojekt.html'));
    }
    if (planningBtn) {
        planningBtn.addEventListener('click', () => navigateTo('planering.html'));
    }
    if (viewScheduleBtn) {
        viewScheduleBtn.addEventListener('click', () => navigateTo('se-schema.html'));
    }
    if (statusBtn) {
        statusBtn.addEventListener('click', () => navigateTo('status.html'));
    }
    if (planningTotalBtn) {
        planningTotalBtn.addEventListener('click', () => navigateTo('planeringtotal.html'));
    }
    if (timeReportingBtn) {
        timeReportingBtn.addEventListener('click', () => navigateTo('tidrapportering.html'));
    }
    if (exportTimeReportBtn) {
        exportTimeReportBtn.addEventListener('click', () => navigateTo('export-time-report.html'));
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Auth state observer
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Kontrollera om användaren är aktiv
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().active) {
                console.log('User is signed in and active:', user);
            } else {
                // Om användaren inte är aktiv, logga ut dem
                await signOut(auth);
                alert('Din användare är inte aktiv. Kontakta administratören.');
                window.location.href = 'login.html';
            }
        } else {
            console.log('No user is signed in.');
            window.location.href = 'login.html';
        }
    });
});

function navigateTo(page) {
    window.location.href = page;
}

// Make navigateTo globally accessible
window.navigateTo = navigateTo;

async function logout() {
    try {
        await signOut(auth);
        alert('Du har loggats ut.');
        navigateTo('login.html'); // Redirect to login page after logout
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Ett fel uppstod vid utloggning.');
    }
}
