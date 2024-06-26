import { db, collection, getDocs, doc, getDoc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectListContainer = document.getElementById('project-list-container');
    const projectList = document.getElementById('project-list');
    const editProjectContainer = document.getElementById('edit-project-container');
    const projectInput = document.getElementById('project-input');
    const customerNameInput = document.getElementById('customer-name');
    const customerPhoneInput = document.getElementById('customer-phone');
    const projectAddressInput = document.getElementById('project-address');
    const projectDescriptionInput = document.getElementById('project-description');
    const projectStatusInput = document.getElementById('project-status');
    const editProjectForm = document.getElementById('edit-project-form');

    let currentProjectId = null;

    // Hämta och visa listan över projekt
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
                <button onclick="editProject('${project.id}')">Redigera</button>
            `;
            projectList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }

    // Funktion för att redigera ett projekt
    window.editProject = async (projectId) => {
        currentProjectId = projectId;
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
                projectListContainer.style.display = 'none';
                editProjectContainer.style.display = 'block';
            } else {
                alert('Projektet kunde inte hittas.');
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    };

    // Uppdatera projektets data
    editProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (currentProjectId) {
            const updatedProject = {
                name: projectInput.value.trim(),
                customerName: customerNameInput.value.trim(),
                customerPhone: customerPhoneInput.value.trim(),
                address: projectAddressInput.value.trim(),
                description: projectDescriptionInput.value.trim(),
                status: projectStatusInput.value.trim()
            };

            try {
                await updateDoc(doc(db, 'projects', currentProjectId), updatedProject);
                alert('Projektet har uppdaterats!');
                window.location.href = 'redigeraprojekt.html';
            } catch (error) {
                console.error('Error updating project:', error);
                alert('Ett fel uppstod vid uppdatering av projektet.');
            }
        }
    });
});
