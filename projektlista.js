import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectList = document.getElementById('project-list');

    try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        projects.forEach(project => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>Projekt:</strong> ${project.name} <br>
                <strong>Kund:</strong> ${project.customerName} <br>
                <strong>Telefon:</strong> ${project.customerPhone} <br>
                <strong>Adress:</strong> ${project.address} <br>
                <strong>Beskrivning:</strong> ${project.description} <br>
                <strong>Status:</strong> ${project.status} <br>
                <button onclick="navigateToEdit('${project.id}')">Redigera</button>
            `;
            projectList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});

function navigateToEdit(projectId) {
    window.location.href = `redigeraprojekt.html?id=${projectId}`;
}
