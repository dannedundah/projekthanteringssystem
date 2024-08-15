import { db, collection, getDocs, updateDoc, doc, deleteDoc, auth, onAuthStateChanged } from './firebase-config.js';
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; 

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
    const usersSnapshot = await getDocs(collection(db, 'users'));

    usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const userItem = document.createElement('div');
        userItem.className = 'user-item';

        const statusButtonClass = userData.active ? 'deactivate' : 'activate';
        const statusButtonText = userData.active ? 'Inaktivera' : 'Aktivera';

        userItem.innerHTML = `
            <p><strong>Namn:</strong> ${userData.firstName} ${userData.lastName}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Status:</strong> ${userData.active ? 'Aktiv' : 'Inaktiv'}</p>
            <button class="user-action ${statusButtonClass}" onclick="toggleUserStatus('${doc.id}', ${userData.active})">
                ${statusButtonText}
            </button>
            <button class="user-action" onclick="deleteUser('${doc.id}')">Ta bort</button>
            <hr>
        `;

        userList.appendChild(userItem);
    });
};

export async function loadProjectManagement() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = '<h2>Hantera projekt</h2><div id="project-list"></div>';

    const projectList = document.getElementById('project-list');
    const projectsSnapshot = await getDocs(collection(db, 'projects'));

    projectsSnapshot.forEach((doc) => {
        const projectData = doc.data();
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';

        projectItem.innerHTML = `
            <p><strong>Projekt Namn:</strong> ${projectData.name}</p>
            <button class="user-action" onclick="deleteProject('${doc.id}')">Ta bort projekt</button>
            <hr>
        `;

        projectList.appendChild(projectItem);
    });
};

window.toggleUserStatus = async (userId, currentStatus) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { active: !currentStatus });
    loadUserManagement(); // Ladda om användarlistan efter uppdatering
};

window.deleteUser = async (userId) => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    loadUserManagement(); // Ladda om användarlistan efter borttagning
};

window.deleteProject = async (projectId) => {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
    loadProjectManagement(); // Ladda om projektlistan efter borttagning
};

window.navigateTo = (page) => {
    window.location.href = page;
};
