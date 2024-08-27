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
    const statusText = userData.active ? 'Aktiv' : 'Inaktiv';

    row.innerHTML = `
        <td>${fullName}</td>
        <td>${userData.email || 'Ingen e-post'}</td>
        <td>
            <select data-uid="${uid}" class="role-select">
                <option value="Admin" ${userData.role === 'Admin' ? 'selected' : ''}>Admin</option>
                <option value="Montör" ${userData.role === 'Montör' ? 'selected' : ''}>Montör</option>
                <option value="Säljare" ${userData.role === 'Säljare' ? 'selected' : ''}>Säljare</option>
                <option value="Service" ${userData.role === 'Service' ? 'selected' : ''}>Service</option>
            </select>
        </td>
        <td>
            <select data-uid="${uid}" class="team-select">
                ${allTeams.map(team => `
                    <option value="${team.name}" ${userData.team === team.name ? 'selected' : ''}>${team.name}</option>
                `).join('')}
            </select>
        </td>
        <td>
            <select data-uid="${uid}" class="status-select">
                <option value="true" ${userData.active ? 'selected' : ''}>Aktiv</option>
                <option value="false" ${!userData.active ? 'selected' : ''}>Inaktiv</option>
            </select>
            <span class="${statusClass}" id="status-label-${uid}">${statusText}</span>
        </td>
        <td><button class="update-role-btn" data-uid="${uid}">Uppdatera</button></td>
    `;
    document.getElementById('roles-table').querySelector('tbody').appendChild(row);

    // Lägg till event listener för att ändra statusfärgen när dropdown-värdet ändras
    const statusSelect = row.querySelector(`select.status-select[data-uid="${uid}"]`);
    statusSelect.addEventListener('change', () => {
        updateStatusColor(uid, statusSelect.value === 'true');
    });
}

// Event listener för att uppdatera roll, team och status
document.getElementById('roles-table').addEventListener('click', async (e) => {
    if (e.target.classList.contains('update-role-btn')) {
        const uid = e.target.getAttribute('data-uid');
        const selectRoleElement = document.querySelector(`select.role-select[data-uid="${uid}"]`);
        const selectTeamElement = document.querySelector(`select.team-select[data-uid="${uid}"]`);
        const selectStatusElement = document.querySelector(`select.status-select[data-uid="${uid}"]`);

        const newRole = selectRoleElement.value;
        const newTeam = selectTeamElement.value;
        const newStatus = selectStatusElement.value === 'true';

        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { role: newRole, team: newTeam, active: newStatus });

            // Uppdatera teamets medlemslista
            await updateTeamMembership(uid, newTeam);

            // Uppdatera färgen på statusen
            updateStatusColor(uid, newStatus);

            alert('Användaruppgifter uppdaterade!');
        } catch (error) {
            console.error('Error updating user data:', error);
            alert('Kunde inte uppdatera användaruppgifterna.');
        }
    }
});

// Funktion för att uppdatera teamets medlemslista
async function updateTeamMembership(userId, newTeamName) {
    // Hämta alla team
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    const allTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Hämta användardata för att använda förnamn och efternamn
    const user = allUsers.find(u => u.id === userId);
    const userName = `${user.firstName} ${user.lastName}`;

    // Ta bort användaren från sitt tidigare team
    for (const team of allTeams) {
        if (team.members && team.members.includes(userName)) {
            const teamRef = doc(db, 'teams', team.id);
            const updatedMembers = team.members.filter(member => member !== userName);
            await updateDoc(teamRef, { members: updatedMembers });
        }
    }

    // Lägg till användaren till det nya teamet
    if (newTeamName) {
        const newTeam = allTeams.find(team => team.name === newTeamName);
        if (newTeam) {
            const teamRef = doc(db, 'teams', newTeam.id);
            const updatedMembers = [...(newTeam.members || []), userName];
            await updateDoc(teamRef, { members: updatedMembers });
        }
    }
}

// Funktion för att uppdatera färgen på statusen
function updateStatusColor(uid, isActive) {
    const statusLabel = document.getElementById(`status-label-${uid}`);
    if (isActive) {
        statusLabel.classList.remove('status-inactive');
        statusLabel.classList.add('status-active');
        statusLabel.textContent = 'Aktiv';
    } else {
        statusLabel.classList.remove('status-active');
        statusLabel.classList.add('status-inactive');
        statusLabel.textContent = 'Inaktiv';
    }
}
