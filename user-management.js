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
    const userList = document.getElementById('user-list');
    const filterDropdown = document.getElementById('user-filter');
    const rolesTableBody = document.getElementById('roles-table').querySelector('tbody');
    
    filterDropdown.style.display = 'block';

    const usersSnapshot = await getDocs(collection(db, 'users'));
    allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderUsers(allUsers);

    // Rendera även roll- och behörighetstabellen
    rolesTableBody.innerHTML = '';
    allUsers.forEach(user => addUserRow(user.id, user));
}

function renderUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Rensa befintlig lista

    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';

        const statusButtonClass = user.active ? 'deactivate' : 'activate';
        const statusButtonText = user.active ? 'Inaktivera' : 'Aktivera';

        userItem.innerHTML = `
            <p><strong>Namn:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Status:</strong> ${user.active ? 'Aktiv' : 'Inaktiv'}</p>
            <button class="user-action ${statusButtonClass}" onclick="toggleUserStatus('${user.id}', ${user.active})">
                ${statusButtonText}
            </button>
            <button class="user-action remove-button" onclick="deleteUser('${user.id}')">Ta bort</button>
            <hr>
        `;

        userList.appendChild(userItem);
    });
}

window.toggleUserStatus = async (userId, currentStatus) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { active: !currentStatus });
    loadUserManagement(); // Ladda om användarlistan efter uppdatering
}

window.deleteUser = async (userId) => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    loadUserManagement(); // Ladda om användarlistan efter borttagning
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
        <td><button class="update-role-btn" data-uid="${uid}">Uppdatera</button></td>
    `;
    document.getElementById('roles-table').querySelector('tbody').appendChild(row);
}

// Event listener för att uppdatera rollen
document.getElementById('roles-table').addEventListener('click', async (e) => {
    if (e.target.classList.contains('update-role-btn')) {
        const uid = e.target.getAttribute('data-uid');
        const selectElement = document.querySelector(`select[data-uid="${uid}"]`);
        const newRole = selectElement.value;

        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { role: newRole });
            alert('Behörighet uppdaterad!');
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Kunde inte uppdatera behörigheten.');
        }
    }
});
