import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
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

// Initialize Firebase if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();
const db = getFirestore();

// Function to handle role-based access
function handleRoleBasedAccess(role) {
  const addProjectBtn = document.getElementById('add-project-btn');
  const planningBtn = document.getElementById('planning-btn');
  const viewScheduleBtn = document.getElementById('view-schedule-btn');
  const statusBtn = document.getElementById('status-btn');
  const planningTotalBtn = document.getElementById('planning-total-btn');
  const timeReportingBtn = document.getElementById('time-reporting-btn');
  const exportTimeReportBtn = document.getElementById('export-time-report-btn');

  // Hide all modules initially
  const allModules = [addProjectBtn, planningBtn, viewScheduleBtn, statusBtn, planningTotalBtn, timeReportingBtn, exportTimeReportBtn];
  allModules.forEach(module => {
    if (module) module.style.display = 'none';
  });

  // Show modules based on the user's role
  if (role === 'Admin') {
    allModules.forEach(module => {
      if (module) module.style.display = 'block';
    });

    // Ensure only one admin link is added
    let existingAdminLink = document.querySelector('a[href="admin.html"]');
    if (!existingAdminLink) {
      const adminLink = document.createElement('a');
      adminLink.href = 'admin.html';
      adminLink.textContent = 'Admin Dashboard';
      document.body.appendChild(adminLink);
    }
  } else if (role === 'Montör') {
    if (viewScheduleBtn) viewScheduleBtn.style.display = 'block';
    if (timeReportingBtn) timeReportingBtn.style.display = 'block';
  } else if (role === 'Säljare') {
    if (planningTotalBtn) planningTotalBtn.style.display = 'block';
    if (timeReportingBtn) timeReportingBtn.style.display = 'block';
  } else if (role === 'Service') {
    if (planningTotalBtn) planningTotalBtn.style.display = 'block';
    if (timeReportingBtn) timeReportingBtn.style.display = 'block';
    if (statusBtn) statusBtn.style.display = 'block';
  } else {
    alert('Du har inte behörighet att se denna sida.');
    window.location.href = 'login.html';
  }
}

// Check authentication state and fetch user data
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
