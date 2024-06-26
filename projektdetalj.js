import { db, doc, getDoc, updateDoc } from './firebase-config.js';

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
                <p><strong>Status:</strong> 
                    <select id="project-status">
                        <option value="Ny" ${project.status === 'Ny' ? 'selected' : ''}>Ny</option>
                        <option value="Planerad" ${project.status === 'Planerad' ? 'selected' : ''}>Planerad</option>
                        <option value="Fakturerad" ${project.status === 'Fakturerad' ? 'selected' : ''}>Fakturerad</option>
                    </select>
                </p>
                ${project.images ? project.images.map(url => `<img src="${url}" alt="Project Image">`).join('') : ''}
                <button onclick="updateProjectStatus('${projectId}')">Uppdatera Status</button>
            `;
        } else {
            projectDetails.textContent = 'Projektet kunde inte hittas.';
        }
    } catch (error) {
        console.error('Error fetching project details:', error);
        projectDetails.textContent = 'Ett fel uppstod vid hämtning av projektdata.';
    }
});

function navigateTo(page) {
    window.location.href = page;
}

async function updateProjectStatus(projectId) {
    const newStatus = document.getElementById('project-status').value;
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { status: newStatus });
        alert('Projektstatus uppdaterad!');
        navigateTo('index.html');
    } catch (error) {
        console.error('Error updating project status:', error);
        alert('Ett fel uppstod vid uppdatering av projektstatus.');
    }
}
