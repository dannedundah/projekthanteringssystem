import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initiera auth och db
const auth = getAuth();
const db = getFirestore();

let allUsers = [];
let allTeams = [];

document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, (user) => {
        const allowedEmails = ['daniel@delidel.se', 'leia@delidel.se', 'sofie@delidel.se'];

        if (!user || !allowedEmails.includes(user.email)) {
            alert('Du har inte behörighet att se denna sida.');
            window.location.href = 'login.html';
            return;
        }

        loadUserManagement(); // Ladda användarhanteringen direkt när sidan laddas
    });
});

async function loadUserManagement() {
    const rolesTableBody = document.getElementById('roles-table').querySelector('tbody');

    // Ladda team från Firestore
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    allTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Definiera den specifika ordningen på teamen
    const teamOrder = ['Team Admin', 'Team Marcus', 'Team Reza', 'Team Rickard', 'Team Service'];

    // Sortera teamen enligt den definierade ordningen
    allTeams.sort((a, b) => {
        return teamOrder.indexOf(a.name) - teamOrder.indexOf(b.name);
    });

    // Ladda alla användare från Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'));
    allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Rendera användare och deras behörighet, status och team
    rolesTableBody.innerHTML = '';
    allUsers.forEach(user => addUserRow(user.id, user));
}

function addUserRow(uid, userData) {
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

    const row = document.createElement('tr');
    const statusClass = userData.active ? 'status-active' : 'status-inactive';

    // Rendera användarens rad med roll, team-tillhörigheter, status och uppdateringsknapp
    row.innerHTML = `
        <td>${fullName}</td>
        <td>${userData.email || 'Ingen e-post'}</td>
        <td>
            <select data-uid="${uid}" class="role-select">
                <option value="Admin" ${userData.role === 'Admin' ? 'selected' : ''}>Admin</option>
                <option value="Montör" ${userData.role === 'Montör' ? 'selected' : ''}>Montör</option>
                <option value="Säljare" ${userData.role === 'Säljare' ? 'selected' : ''}>Säljare</option>
                <option value="Service" ${userData.role === 'Service' ? 'selected' : ''}>Service</option>
                <option value="Elektriker" ${userData.role === 'Elektriker' ? 'selected' : ''}>Elektriker</option>
            </select>
        </td>
        ${allTeams.map(team => `
            <td>
                <input type="checkbox" data-uid="${uid}" data-team="${team.name}" ${userData.teams && userData.teams.includes(team.name) ? 'checked' : ''}>
            </td>
        `).join('')}
        <td>
            <select data-uid="${uid}" class="status-select ${statusClass}">
                <option value="true" ${userData.active ? 'selected' : ''}>Aktiv</option>
                <option value="false" ${!userData.active ? 'selected' : ''}>Inaktiv</option>
            </select>
        </td>
        <td><button class="update-role-btn" data-uid="${uid}">Uppdatera</button></td>
    `;
    document.getElementById('roles-table').querySelector('tbody').appendChild(row);
}

// Event listener för att uppdatera roll, team och status
document.getElementById('roles-table').addEventListener('click', async (e) => {
    if (e.target.classList.contains('update-role-btn')) {
        const uid = e.target.getAttribute('data-uid');
        const selectRoleElement = document.querySelector(`select.role-select[data-uid="${uid}"]`);
        const selectStatusElement = document.querySelector(`select.status-select[data-uid="${uid}"]`);
        const teamCheckboxes = document.querySelectorAll(`input[type="checkbox"][data-uid="${uid}"]`);

        const newRole = selectRoleElement.value;
        const newStatus = selectStatusElement.value === 'true';
        const newTeams = Array.from(teamCheckboxes)
                              .filter(checkbox => checkbox.checked)
                              .map(checkbox => checkbox.getAttribute('data-team')); // Här sparas teamnamnet korrekt

        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { role: newRole, teams: newTeams, active: newStatus });

            // Uppdatera teamens medlemslistor
            await updateTeamMembership(uid, newTeams);

            alert('Användaruppgifter uppdaterade!');
        } catch (error) {
            console.error('Error updating user data:', error);
            alert('Kunde inte uppdatera användaruppgifterna.');
        }
    }
});

// Funktion för att uppdatera teamens medlemslistor
async function updateTeamMembership(userId, newTeamNames) {
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    const allTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const user = allUsers.find(u => u.id === userId);
    const userName = `${user.firstName} ${user.lastName}`;

    // Ta bort användaren från alla team (rensa tidigare teamtillhörighet)
    for (const team of allTeams) {
        if (team.members && team.members.includes(userName)) {
            const teamRef = doc(db, 'teams', team.id);
            const updatedMembers = team.members.filter(member => member !== userName);
            await updateDoc(teamRef, { members: updatedMembers });
        }
    }

    // Lägg till användaren till de nya teamen, om de inte redan är medlemmar
    for (const newTeamName of newTeamNames) {
        const newTeam = allTeams.find(team => team.name === newTeamName);
        if (newTeam) {
            const teamRef = doc(db, 'teams', newTeam.id);
            let updatedMembers = newTeam.members || [];

            // Kolla om användaren redan är i medlemslistan
            if (!updatedMembers.includes(userName)) {
                updatedMembers.push(userName); // Lägg till användaren om de inte redan är i listan
            }

            await updateDoc(teamRef, { members: updatedMembers });
        }
    }
}

// Funktion för att uppdatera färgen på statusen
function updateStatusColor(selectElement, isActive) {
    if (isActive) {
        selectElement.classList.remove('status-inactive');
        selectElement.classList.add('status-active');
    } else {
        selectElement.classList.remove('status-active');
        selectElement.classList.add('status-inactive');
    }
}
