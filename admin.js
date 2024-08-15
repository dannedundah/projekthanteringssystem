import { db, collection, getDocs, updateDoc, doc, auth, onAuthStateChanged } from './firebase-config.js';
// Importera endast deleteDoc om det inte redan är importerat någon annanstans
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; 

let allUsers = []; // Håll koll på alla användare

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        const allowedEmails = ['daniel@delidel.se', 'leia@delidel.se', 'sofie@delidel.se'];

        if (!user || !allowedEmails.includes(user.email)) {
            alert('Du har inte behörighet att se denna sida.');
            window.location.href = 'login.html';
        }
    });
});

export async function loadUserManagement() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = '<h2>Hantera användare</h2><div id="user-list"></div>';

    const userList = document.getElementById('user-list');
    const filterDropdown = document.getElementById('user-filter');
    filterDropdown.style.display = 'block'; // Visa filter dropdown

    const usersSnapshot = await getDocs(collection(db, 'users'));

    allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Spara alla användare

    renderUsers(allUsers); // Initial render för alla användare
}

export function filterUsers(filter) {
    let filteredUsers = allUsers;

    if (filter === 'active') {
        filteredUsers = allUsers.filter(user => user.active);
    } else if (filter === 'inactive') {
        filteredUsers = allUsers.filter(user => !user.active);
    }

    renderUsers(filteredUsers);
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

window.deleteProject = async (projectId) => {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
    loadProjectManagement(); // Ladda om projektlistan efter borttagning
}

window.navigateTo = (page) => {
    window.location.href = page;
}
