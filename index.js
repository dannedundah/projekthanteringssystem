import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyDYqBOra2wDjyPweyBGnkVMANsvLOx9pps",
  authDomain: "projekthanteringsystem.firebaseapp.com",
  projectId: "projekthanteringsystem",
  storageBucket: "projekthanteringsystem.appspot.com",
  messagingSenderId: "87207954816",
  appId: "1:87207954816:web:167659270c0d6eee901965",
  measurementId: "G-8HMD30CFYS"
};

// Initiera Firebase
if (!getApps().length) {
    initializeApp(firebaseConfig);
}

const auth = getAuth();
const db = getFirestore();

document.addEventListener('DOMContentLoaded', () => {
    const addProjectBtn = document.getElementById('add-project-btn');
    const planningBtn = document.getElementById('planning-btn');
    const viewScheduleBtn = document.getElementById('view-schedule-btn');
    const statusBtn = document.getElementById('status-btn');
    const planningTotalBtn = document.getElementById('planning-total-btn');
    const timeReportingBtn = document.getElementById('time-reporting-btn');
    const exportTimeReportBtn = document.getElementById('export-time-report-btn');
    const exportTimeReportBtn = document.getElementById('timmar_per_projekt-btn');
    const testModuleBtn = document.getElementById('test-module-btn');
    const arbetsmiljoBtn = document.getElementById('arbetsmiljo-btn');
    const servicePlanningBtn = document.getElementById('serviceplanering-btn'); // Knappen för serviceplanering
    const adminDashboardLink = document.getElementById('admin-dashboard');
    const logoutBtn = document.getElementById('logout-btn');

    // Auth observer
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().active) {
                const userRole = userDoc.data().role;

                // Visa testmodulen om det är Daniel
                if (user.email === 'daniel@delidel.se' || user.email === 'hampus@delidel.se') {
                    testModuleBtn.style.display = 'block';
                }

                // Hantera rollbaserad åtkomst
                handleRoleBasedAccess(userRole);
            } else {
                await signOut(auth);
                alert('Din användare är inte aktiv. Kontakta administratören.');
                window.location.href = 'login.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // Navigering till olika moduler
    if (addProjectBtn) addProjectBtn.addEventListener('click', () => navigateTo('läggatillprojekt.html'));
    if (planningBtn) planningBtn.addEventListener('click', () => navigateTo('planering.html'));
    if (viewScheduleBtn) viewScheduleBtn.addEventListener('click', () => navigateTo('se-schema.html'));
    if (statusBtn) statusBtn.addEventListener('click', () => navigateTo('status.html'));
    if (planningTotalBtn) planningTotalBtn.addEventListener('click', () => navigateTo('planeringtotal.html'));
    if (timeReportingBtn) timeReportingBtn.addEventListener('click', () => navigateTo('tidrapportering.html'));
    if (exportTimeReportBtn) exportTimeReportBtn.addEventListener('click', () => navigateTo('export-time-report.html'));
    if (testModuleBtn) testModuleBtn.addEventListener('click', () => navigateTo('testmodul.html'));
    if (arbetsmiljoBtn) arbetsmiljoBtn.addEventListener('click', () => navigateTo('arbetsmiljo.html'));
    if (servicePlanningBtn) servicePlanningBtn.addEventListener('click', () => navigateTo('serviceplanering.html')); // Navigering till serviceplanering
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

// Hantera åtkomst baserat på användarens roll
function handleRoleBasedAccess(role) {
    const addProjectBtn = document.getElementById('add-project-btn');
    const planningBtn = document.getElementById('planning-btn');
    const viewScheduleBtn = document.getElementById('view-schedule-btn');
    const statusBtn = document.getElementById('status-btn');
    const planningTotalBtn = document.getElementById('planning-total-btn');
    const timeReportingBtn = document.getElementById('time-reporting-btn');
    const exportTimeReportBtn = document.getElementById('export-time-report-btn');
    const servicePlanningBtn = document.getElementById('serviceplanering-btn'); // Serviceplanering-knapp
    const adminDashboardLink = document.getElementById('admin-dashboard'); 

    if (role === 'Admin') {
        if (addProjectBtn) addProjectBtn.style.display = 'block';
        if (planningBtn) planningBtn.style.display = 'block';
        if (viewScheduleBtn) viewScheduleBtn.style.display = 'block';
        if (statusBtn) statusBtn.style.display = 'block';
        if (planningTotalBtn) planningTotalBtn.style.display = 'block';
        if (timeReportingBtn) timeReportingBtn.style.display = 'block';
        if (exportTimeReportBtn) exportTimeReportBtn.style.display = 'block';
        if (adminDashboardLink) adminDashboardLink.style.display = 'block';
        if (servicePlanningBtn) servicePlanningBtn.style.display = 'block'; // Visa serviceplaneringsknappen för Admin
    } else if (role === 'Service') {
        if (servicePlanningBtn) servicePlanningBtn.style.display = 'block'; // Visa serviceplaneringsknappen för Service-rollen
        if (planningTotalBtn) planningTotalBtn.style.display = 'block';
        if (timeReportingBtn) timeReportingBtn.style.display = 'block';
        if (statusBtn) statusBtn.style.display = 'block';
    } else if (role === 'Montör') {
        if (viewScheduleBtn) viewScheduleBtn.style.display = 'block';
        if (timeReportingBtn) timeReportingBtn.style.display = 'block';
    } else if (role === 'Säljare') {
        if (planningTotalBtn) planningTotalBtn.style.display = 'block';
        if (timeReportingBtn) timeReportingBtn.style.display = 'block';
        if (statusBtn) statusBtn.style.display = 'block';
    } else if (role === 'Elektriker') {
        if (planningTotalBtn) planningTotalBtn.style.display = 'block';
        if (statusBtn) statusBtn.style.display = 'block';
    } else {
        alert('Du har inte behörighet att se denna sida.');
        window.location.href = 'login.html';
    }
}

// Navigeringsfunktion
function navigateTo(page) {
    window.location.href = page;
}

// Logga ut
async function logout() {
    try {
        await signOut(auth);
        alert('Du har loggats ut.');
        navigateTo('login.html'); 
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Ett fel uppstod vid utloggning.');
    }
}
