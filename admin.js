import { db, collection, getDocs, updateDoc, doc, deleteDoc, auth, onAuthStateChanged } from './firebase-config.js';
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        // Lista över tillåtna e-postadresser för admin
        const allowedEmails = ['daniel@delidel.se', 'leia@delidel.se', 'sofie@delidel.se'];

        if (user) {
            // Kontrollera om användaren har en tillåten e-postadress
            if (allowedEmails.includes(user.email)) {
                console.log(`Användare ${user.email} har åtkomst till adminpanelen.`);
                // Fortsätt till adminpanelen
                loadAdminDashboard();
            } else {
                alert('Du har inte behörighet att se denna sida.');
                window.location.href = 'login.html'; // Skicka tillbaka till inloggningssidan
            }
        } else {
            // Om ingen användare är inloggad, skicka tillbaka till inloggningssidan
            window.location.href = 'login.html';
        }
    });
});

function loadAdminDashboard() {
    // Detta är där du laddar och visar admininnehållet
    // Om du vill kan du också dölja inloggningsknappen eller visa adminspecifik information här
    console.log("Adminpanelen laddas...");
    // Din befintliga kod för att ladda adminpanelen kan placeras här
}

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

export async function loadProjectManagement() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = '<h2>Hantera projekt</h2><div id="project-list"></div>';

    const projectList = document.getElementById('project-list');
    const searchField = document.getElementById('project-search');
    searchField.style.display = 'block'; // Visa sökfältet

    const projectsSnapshot = await getDocs(collection(db, 'projects'));

    allProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Spara alla projekt

    renderProjects(allProjects); // Initial render för alla projekt
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
