import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectDetails = document.getElementById('project-details');
    const params = new URLSearchParams(window.location.search);
    const projectName = params.get('name');

    try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projects = querySnapshot.docs.map(doc => doc.data());
        const project = projects.find(p => p.name === projectName);

        if (project) {
            projectDetails.innerHTML = `
                <h2>${project.name}</h2>
                <p><strong>Kundnamn:</strong> ${project.customerName}</p>
                <p><strong>Telefonnummer:</strong> ${project.customerPhone}</p>
                <p><strong>Adress:</strong> ${project.address}</p>
                <p><strong>Beskrivning:</strong> ${project.description}</p>
                <p><strong>Status:</strong> ${project.status}</p>
                <img src="${project.imageUrl}" alt="Projektbild" style="max-width: 100%;">
            `;
        } else {
            projectDetails.textContent = 'Projektet kunde inte hittas.';
        }
    } catch (error) {
        console.error('Error fetching project details:', error);
        projectDetails.textContent = 'Ett fel uppstod vid hämtning av projektdata.';
    }
});
