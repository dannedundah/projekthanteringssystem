import { db, collection, getDocs, doc, getDoc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectList = document.getElementById('project-list');
    const projectListContainer = document.getElementById('edit-project-section');
    const editProjectContainer = document.createElement('div');
    editProjectContainer.style.display = 'none';
    editProjectContainer.innerHTML = `
        <h2>Redigera Projekt</h2>
        <form id="edit-project-form">
            <input type="text" id="project-input" placeholder="Projektets namn" required>
            <input type="text" id="customer-name" placeholder="Kundnamn" required>
            <input type="text" id="customer-phone" placeholder="Telefonnummer" required>
            <input type="text" id="project-address" placeholder="Adress" required>
            <textarea id="project-description" placeholder="Projektbeskrivning" required></textarea>
            <select id="project-status" required>
                <option value="Ny">Ny</option>
                <option value="Planerad">Planerad</option>
                <option value="Solceller klart">Solceller klart</option>
                <option value="Elektriker klar">Elektriker klar</option>
                <option value="Drifsatt">Drifsatt</option>
            </select>
            <button type="submit">Uppdatera projekt</button>
        </form>
    `;
    document.body.appendChild(editProjectContainer);

    let currentProjectId = null;

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

    window.editProject = async (projectId) => {
        currentProjectId = projectId;
        try {
            const projectRef = doc(db, 'projects', projectId);
            const projectSnap = await getDoc(projectRef);

            if (projectSnap.exists()) {
                const project = projectSnap.data();
                document.getElementById('project-input').value = project.name;
                document.getElementById('customer-name').value = project.customerName;
                document.getElementById('customer-phone').value = project.customerPhone;
                document.getElementById('project-address').value = project.address;
                document.getElementById('project-description').value = project.description;
                document.getElementById('project-status').value = project.status;
                projectListContainer.style.display = 'none';
                editProjectContainer.style.display = 'block';
            } else {
                alert('Projektet kunde inte hittas.');
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    };

    document.getElementById('edit-project-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (currentProjectId) {
            const updatedProject = {
                name: document.getElementById('project-input').value.trim(),
                customerName: document.getElementById('customer-name').value.trim(),
                customerPhone: document.getElementById('customer-phone').value.trim(),
                address: document.getElementById('project-address').value.trim(),
                description: document.getElementById('project-description').value.trim(),
                status: document.getElementById('project-status').value.trim()
            };

            try {
                await updateDoc(doc(db, 'projects', currentProjectId), updatedProject);
                alert('Projektet har uppdaterats!');
                window.location.href = 'projekthantering.html';
            } catch (error) {
                console.error('Error updating project:', error);
                alert('Ett fel uppstod vid uppdatering av projektet.');
            }
        }
    });
});
