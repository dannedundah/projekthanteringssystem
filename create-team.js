import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Din Firebase-konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyDYqBOra2wDjyPweyBGnkVMANsvLOx9pps",
    authDomain: "projekthanteringsystem.firebaseapp.com",
    projectId: "projekthanteringsystem",
    storageBucket: "projekthanteringsystem.appspot.com",
    messagingSenderId: "87207954816",
    appId: "1:87207954816:web:167659270c0d6eee901965",
    measurementId: "G-8HMD30CFYS"
};

// Initiera Firebase om det inte redan är initierat
if (!getApps().length) {
    initializeApp(firebaseConfig);
}

// Hämta Firestore-instansen
const db = getFirestore();

document.addEventListener('DOMContentLoaded', async () => {
    const teamList = document.getElementById('team-list');
    const createTeamForm = document.getElementById('create-team-form');

    // Ladda befintliga team
    async function loadTeams() {
        teamList.innerHTML = ''; // Töm teamlistan
        const querySnapshot = await getDocs(collection(db, 'teams'));
        querySnapshot.forEach((doc) => {
            const team = doc.data();
            const li = document.createElement('li');
            li.textContent = team.name;
            
            // Lägg till en ta bort-knapp
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Ta bort';
            deleteButton.onclick = async () => {
                await deleteDoc(doc(db, 'teams', doc.id));
                loadTeams(); // Ladda om teamlistan efter borttagning
            };
            li.appendChild(deleteButton);

            teamList.appendChild(li);
        });
    }

    // Hantera formulärinlämning för att skapa nytt team
    createTeamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const teamName = document.getElementById('team-name').value.trim();

        if (teamName) {
            await addDoc(collection(db, 'teams'), { name: teamName });
            document.getElementById('team-name').value = ''; // Töm inmatningsfältet
            loadTeams(); // Ladda om teamlistan efter att ett nytt team har skapats
        } else {
            alert('Ange ett teamnamn.');
        }
    });

    // Ladda team när sidan har laddats
    loadTeams();
});
