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
        <td><span class="${statusClass}">${statusText}</span></td>
        <td><button class="update-role-btn" data-uid="${uid}">Uppdatera</button></td>
    `;
    document.getElementById('roles-table').querySelector('tbody').appendChild(row);
}

// Event listener för att uppdatera roll, team och status
document.getElementById('roles-table').addEventListener('click', async (e) => {
    if (e.target.classList.contains('update-role-btn')) {
        const uid = e.target.getAttribute('data-uid');
        const selectRoleElement = document.querySelector(`select.role-select[data-uid="${uid}"]`);
        const selectTeamElement = document.querySelector(`select.team-select[data-uid="${uid}"]`);
        const newRole = selectRoleElement.value;
        const newTeam = selectTeamElement.value;

        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { role: newRole, team: newTeam });
            alert('Användaruppgifter uppdaterade!');
        } catch (error) {
            console.error('Error updating user data:', error);
            alert('Kunde inte uppdatera användaruppgifterna.');
        }
    }
});
