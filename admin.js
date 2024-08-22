import { db, collection, getDocs, updateDoc, doc, auth, onAuthStateChanged } from './firebase-config.js';
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

let allUsers = [];
let allProjects = [];
let isUserManagementVisible = false; // För att hålla koll på synligheten av användarhantering
let isProjectManagementVisible = false; // För att hålla koll på synligheten av projekthantering

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

    // Kontrollera om användarhanteringen redan är synlig
    if (isUserManagementVisible) {
        adminContent.innerHTML = ''; // Rensa innehållet för att dölja det
        isUserManagementVisible = false;
        return;
    }

    // Om det inte är synligt, ladda innehållet
    adminContent.innerHTML = '<h2>Hantera användare</h2><div id="user-list"></div>';
    const userList = document.getElementById('user-list');
    const filterDropdown = document.getElementById('user-filter');
    filterDropdown.style.display = 'block';

    const usersSnapshot = await getDocs(collection(db, 'users'));
    allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderUsers(allUsers);

    isUserManagementVisible = true; // Markera som synligt
    isProjectManagementVisible = false; // Se till att den andra modulen är dold
}

export async function loadProjectManagement() {
    const adminContent = document.getElementById('admin-content');

    // Kontrollera om projekthanteringen redan är synlig
    if (isProjectManagementVisible) {
        adminContent.innerHTML = ''; // Rensa innehållet för att dölja det
        isProjectManagementVisible = false;
        return;
    }

    // Om det inte är synligt, ladda innehållet
    adminContent.innerHTML = '<h2>Hantera projekt</h2><div id="project-list"></div>';
    const projectList = document.getElementById('project-list');
    const searchField = document.getElementById('project-search');
    searchField.style.display = 'block';

    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    allProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProjects(allProjects);

    isProjectManagementVisible = true; // Markera som synligt
    isUserManagementVisible = false; // Se till att den andra modulen är dold
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

export function searchProjects(query) {
    const filteredProjects = allProjects.filter(project =>
        project.address.toLowerCase().includes(query.toLowerCase())
    );
    renderProjects(filteredProjects);
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

function renderProjects(projects) {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = ''; // Rensa befintlig lista

    projects.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';

        projectItem.innerHTML = `
            <p><strong>Adress:</strong> ${project.address}</p>
            <button class="user-action remove-button" onclick="deleteProject('${project.id}')">Ta bort projekt</button>
            <hr>
        `;

        projectList.appendChild(projectItem);
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
