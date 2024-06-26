import { db, doc, getDoc } from './firebase-config.js';
import { updateProjectStatus } from './main.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectDetails = document.getElementById('project-details');
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            const project = projectSnap.data();
            projectDetails.innerHTML = `
                <h2>${project.name}</h2>
                <p><strong>Kundnamn:</strong> ${project.customerName}</p>
                <p><strong>Telefonnummer:</strong> ${project.customerPhone}</p>
                <p><strong>Adress:</strong> ${project.address}</p>
                <p><strong>Beskrivning:</strong> ${project.description}</p>
                <p><strong>Status:</strong> ${project.status}</p>
                ${project.images ? project.images.map(url => `<img src="${url}" alt="Project Image">`).join('') : ''}
            `;
            document.getElementById('project-status').value = project.status;
        } else {
            projectDetails.textContent = 'Projektet kunde inte hittas.';
        }
    } catch (error) {
        console.error('Error fetching project details:', error);
        projectDetails.textContent = 'Ett fel uppstod vid hämtning av projektdata.';
    }
});

window.updateProjectStatusHandler = function() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const newStatus = document.getElementById('project-status').value;
    updateProjectStatus(projectId, newStatus);
}

function navigateTo(page) {
    window.location.href = page;
}
