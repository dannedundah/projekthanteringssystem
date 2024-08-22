import { db, collection, getDocs, doc, auth, onAuthStateChanged } from './firebase-config.js';
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

let allProjects = [];

document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, (user) => {
        const allowedEmails = ['daniel@delidel.se', 'leia@delidel.se', 'sofie@delidel.se'];

        if (!user || !allowedEmails.includes(user.email)) {
            alert('Du har inte behörighet att se denna sida.');
            window.location.href = 'login.html';
            return;
        }

        loadProjectManagement(); // Ladda projekthanteringen direkt när sidan laddas
    });
});

async function loadProjectManagement() {
    const projectList = document.getElementById('project-list');
    const searchField = document.getElementById('project-search');
    searchField.style.display = 'block';

    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    allProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProjects(allProjects);
}

// Exportera funktionen och gör den globalt tillgänglig
export function searchProjects(query) {
    const filteredProjects = allProjects.filter(project =>
        project.address.toLowerCase().includes(query.toLowerCase())
    );
    renderProjects(filteredProjects);
}

// Lägg till funktionen till `window` för att göra den globalt tillgänglig
window.searchProjects = searchProjects;

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

window.deleteProject = async (projectId) => {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
    loadProjectManagement(); // Ladda om projektlistan efter borttagning
}
