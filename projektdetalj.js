import { db, doc, getDoc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectDetails = document.getElementById('project-details');
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    if (projectId) {
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
                        <select id="status-select">
                            <option value="Ny" ${project.status === 'Ny' ? 'selected' : ''}>Ny</option>
                            <option value="Planerad" ${project.status === 'Planerad' ? 'selected' : ''}>Planerad</option>
                            <option value="Solceller klart" ${project.status === 'Solceller klart' ? 'selected' : ''}>Solceller klart</option>
                            <option value="Elektriker klar" ${project.status === 'Elektriker klar' ? 'selected' : ''}>Elektriker klar</option>
                            <option value="Drifsatt" ${project.status === 'Drifsatt' ? 'selected' : ''}>Drifsatt</option>
                        </select>
                    </p>
                    ${project.images ? project.images.map(url => `<img src="${url}" alt="Project Image">`).join('') : ''}
                `;

                // Add event listener to the status select element
                document.getElementById('status-select').addEventListener('change', async (event) => {
                    const newStatus = event.target.value;
                    await updateDoc(projectRef, { status: newStatus });
                    alert('Status uppdaterad!');
                });
            } else {
                projectDetails.textContent = 'Projektet kunde inte hittas.';
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
            projectDetails.textContent = 'Ett fel uppstod vid hämtning av projektdata.';
        }
    } else {
        projectDetails.textContent = 'Inget projekt ID angivet.';
    }
});

function navigateTo(page) {
    window.location.href = page;
}
