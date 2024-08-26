import { db, collection, getDocs, updateDoc, doc, auth, onAuthStateChanged } from './firebase-config.js';
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

let allUsers = [];

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
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Rendera användare och deras behörighet och status
    rolesTableBody.innerHTML = '';
    allUsers.forEach(user => addUserRow(user.id, user));
}

function addUserRow(uid, userData) {
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

    const row = document.createElement('tr');
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
            <select data-uid="${uid}" class="status-select">
                <option value="active" ${userData.active ? 'selected' : ''}>Aktiv</option>
                <option value="inactive" ${!userData.active ? 'selected' : ''}>Inaktiv</option>
            </select>
        </td>
        <td><button class="update-role-btn" data-uid="${uid}">Uppdatera</button></td>
    `;
    document.getElementById('roles-table').querySelector('tbody').appendChild(row);
}

// Event listener för att uppdatera roll och status
document.getElementById('roles-table').addEventListener('click', async (e) => {
    if (e.target.classList.contains('update-role-btn')) {
        const uid = e.target.getAttribute('data-uid');
        const selectRoleElement = document.querySelector(`select.role-select[data-uid="${uid}"]`);
        const selectStatusElement = document.querySelector(`select.status-select[data-uid="${uid}"]`);

        const newRole = selectRoleElement.value;
        const newStatus = selectStatusElement.value === 'active';

        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { role: newRole, active: newStatus });
            alert('Användaruppgifter uppdaterade!');
        } catch (error) {
            console.error('Error updating user data:', error);
            alert('Kunde inte uppdatera användaruppgifterna.');
        }
    }
});
