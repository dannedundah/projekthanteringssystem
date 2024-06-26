import { db, doc, getDoc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    const projectInput = document.getElementById('project-input');
    const customerNameInput = document.getElementById('customer-name');
    const customerPhoneInput = document.getElementById('customer-phone');
    const projectAddressInput = document.getElementById('project-address');
    const projectDescriptionInput = document.getElementById('project-description');
    const projectStatusInput = document.getElementById('project-status');
    const editProjectForm = document.getElementById('edit-project-form');

    // Hämta projektets aktuella data
    try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            const project = projectSnap.data();
            projectInput.value = project.name;
            customerNameInput.value = project.customerName;
            customerPhoneInput.value = project.customerPhone;
            projectAddressInput.value = project.address;
            projectDescriptionInput.value = project.description;
            projectStatusInput.value = project.status;
        } else {
            alert('Projektet kunde inte hittas.');
            window.location.href = 'redigeraprojekt.html';
        }
    } catch (error) {
        console.error('Error fetching project:', error);
    }

    // Uppdatera projektets data
    editProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedProject = {
            name: projectInput.value.trim(),
            customerName: customerNameInput.value.trim(),
            customerPhone: customerPhoneInput.value.trim(),
            address: projectAddressInput.value.trim(),
            description: projectDescriptionInput.value.trim(),
            status: projectStatusInput.value.trim()
        };

        try {
            await updateDoc(doc(db, 'projects', projectId), updatedProject);
            alert('Projektet har uppdaterats!');
            window.location.href = 'redigeraprojekt.html';
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Ett fel uppstod vid uppdatering av projektet.');
        }
    });
});
