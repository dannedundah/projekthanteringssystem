import { db, collection, getDocs, updateDoc, doc, auth, onAuthStateChanged } from './firebase-config.js';
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; // Importera deleteDoc från Firebase SDK

document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('user-list');
    const projectList = document.getElementById('project-list');

    onAuthStateChanged(auth, async (user) => {
        const allowedEmails = ['daniel@delidel.se', 'leia@delidel.se', 'sofie@delidel.se'];

        if (user && allowedEmails.includes(user.email)) {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const projectsSnapshot = await getDocs(collection(db, 'projects'));

            usersSnapshot.forEach((doc) => {
                const userData = doc.data();
                const userItem = document.createElement('div');
                userItem.className = 'user-item';

                userItem.innerHTML = `
                    <p><strong>Namn:</strong> ${userData.firstName} ${userData.lastName}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Status:</strong> ${userData.active ? 'Aktiv' : 'Inaktiv'}</p>
                    <button onclick="toggleUserStatus('${doc.id}', ${userData.active})">
                        ${userData.active ? 'Inaktivera' : 'Aktivera'}
                    </button>
                    <button onclick="deleteUser('${doc.id}')">Ta bort</button>
                    <hr>
                `;

                userList.appendChild(userItem);
            });

            projectsSnapshot.forEach((doc) => {
                const projectData = doc.data();
                const projectItem = document.createElement('div');
                projectItem.className = 'project-item';

                projectItem.innerHTML = `
                    <p><strong>Projekt Namn:</strong> ${projectData.name}</p>
                    <button onclick="deleteProject('${doc.id}')">Ta bort projekt</button>
                    <hr>
                `;

                projectList.appendChild(projectItem);
            });

        } else {
            alert('Du har inte behörighet att se denna sida.');
            window.location.href = 'login.html';
        }
    });
});

window.toggleUserStatus = async (userId, currentStatus) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { active: !currentStatus });
    window.location.reload(); // Uppdatera sidan för att visa ändringar
};

window.deleteUser = async (userId) => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    window.location.reload(); // Uppdatera sidan för att visa ändringar
};

window.deleteProject = async (projectId) => {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
    window.location.reload(); // Uppdatera sidan för att visa ändringar
};

window.navigateTo = (page) => {
    window.location.href = page;
};
