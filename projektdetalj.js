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
                <p><strong>Status:</strong> ${project.status}</p>
                ${project.images ? project.images.map(url => `<img src="${url}" alt="Project Image">`).join('') : ''}
                <select id="project-status" onchange="updateProjectStatus('${projectId}')">
                    <option value="Ny" ${project.status === 'Ny' ? 'selected' : ''}>Ny</option>
                    <option value="Planerad" ${project.status === 'Planerad' ? 'selected' : ''}>Planerad</option>
                    <option value="Fakturerad" ${project.status === 'Fakturerad' ? 'selected' : ''}>Fakturerad</option>
                </select>
            `;
        } else {
            projectDetails.textContent = 'Projektet kunde inte hittas.';
        }
    } catch (error) {
        console.error('Error fetching project details:', error);
        projectDetails.textContent = 'Ett fel uppstod vid hämtning av projektdata.';
    }
});

async function updateProjectStatus(projectId) {
    const status = document.getElementById('project-status').value;
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { status: status });
        alert('Projektstatus uppdaterad!');
    } catch (error) {
        console.error('Error updating project status:', error);
        alert('Ett fel uppstod vid uppdatering av projektstatus.');
    }
}

window.navigateTo = (page) => {
    window.location.href = page;
};
