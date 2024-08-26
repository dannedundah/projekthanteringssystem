import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

function handleRoleBasedAccess(role) {
    const adminModules = document.getElementById('admin-module');
    const montorModules = document.getElementById('montor-module');
    const saljareModules = document.getElementById('saljare-module');
    const serviceModules = document.getElementById('service-module');

    // Show all modules for Admin
    if (role === 'Admin') {
        if (adminModules) adminModules.style.display = 'block';
        if (montorModules) montorModules.style.display = 'block';
        if (saljareModules) saljareModules.style.display = 'block';
        if (serviceModules) serviceModules.style.display = 'block';
    } else if (role === 'Montör') {
        if (montorModules) montorModules.style.display = 'block';
    } else if (role === 'Säljare') {
        if (saljareModules) saljareModules.style.display = 'block';
    } else if (role === 'Service') {
        if (serviceModules) serviceModules.style.display = 'block';
    } else {
        alert('Du har inte behörighet att se denna sida.');
        window.location.href = 'index.html';
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("User data:", userData);

                // Handle role-based access
                handleRoleBasedAccess(userData.role);
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

function navigateTo(page) {
    window.location.href = page;
}

window.navigateTo = navigateTo;
