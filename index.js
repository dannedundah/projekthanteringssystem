import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Lägg till Google API-klientbiblioteket
const CLIENT_ID = '890081653871-obtrck5li44tia4akjgetbqduerep6g1.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBCQy7S_9Dm7vV8tnyscU_-7m4NmH9QkJM';
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

gapi.load('client:auth2', () => {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    });
});

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "projekthanteringsystem.firebaseapp.com",
  projectId: "projekthanteringsystem",
  storageBucket: "projekthanteringsystem.appspot.com",
  messagingSenderId: "87207954816",
  appId: "1:87207954816:web:167659270c0d6eee901965",
  measurementId: "G-8HMD30CFYS"
};

// Kontrollera om appen redan är initierad
if (!getApps().length) {
    initializeApp(firebaseConfig);
}

const auth = getAuth();
const db = getFirestore();
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
    const googleSheetsBtn = document.getElementById('google-sheets-btn'); // Ny knapp för Google Sheets

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
    if (googleSheetsBtn) {  // Lägg till event listener för Google Sheets-knappen
        googleSheetsBtn.addEventListener('click', handleGoogleSheetsAuth);
    }

    // Auth state observer
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Kontrollera om användaren är aktiv
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().active) {
                const userRole = userDoc.data().role;
                // Hantera rollbaserad åtkomst
                handleRoleBasedAccess(userRole);
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

function handleGoogleSheetsAuth() {
    gapi.auth2.getAuthInstance().signIn().then(() => {
        fetchSheetData();
    }).catch(error => {
        console.error('Error authenticating with Google Sheets:', error);
    });
}

function fetchSheetData() {
    const sheetId = 'https://docs.google.com/spreadsheets/d/1a49NWK76spp_WOA-ST4uCvj81ktp1hjBOvzAK6JOSbA/edit?gid=1543502340#gid=1543502340';
    const range = 'Test med material!A1:D10';  // Justera efter behov

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
    }).then(response => {
        const rows = response.result.values;
        if (rows.length) {
            console.log('Data hämtad från Google Sheet:');
            rows.forEach((row) => {
                console.log(row.join(', '));
            });
        } else {
            console.log('Inga data funna.');
        }
    }).catch(error => {
        console.error('Error fetching data from Google Sheets:', error);
    });
}

function handleRoleBasedAccess(role) {
    if (role === 'Admin') {
        document.getElementById('add-project-btn').style.display = 'block';
        document.getElementById('planning-btn').style.display = 'block';
        document.getElementById('view-schedule-btn').style.display = 'block';
        document.getElementById('status-btn').style.display = 'block';
        document.getElementById('planning-total-btn').style.display = 'block';
        document.getElementById('time-reporting-btn').style.display = 'block';
        document.getElementById('export-time-report-btn').style.display = 'block';

        // Länk till adminpanelen
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.textContent = 'Admin Dashboard';
        document.body.appendChild(adminLink);
    } else if (role === 'Montör') {
        document.getElementById('view-schedule-btn').style.display = 'block';
        document.getElementById('time-reporting-btn').style.display = 'block';
    } else if (role === 'Säljare') {
        document.getElementById('planning-total-btn').style.display = 'block';
        document.getElementById('time-reporting-btn').style.display = 'block';
    } else if (role === 'Service') {
        document.getElementById('planning-total-btn').style.display = 'block';
        document.getElementById('time-reporting-btn').style.display = 'block';
        document.getElementById('status-btn').style.display = 'block';
    } else {
        alert('Du har inte behörighet att se denna sida.');
        window.location.href = 'login.html';
    }
}

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
