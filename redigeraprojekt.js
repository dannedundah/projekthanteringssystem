import { db, collection, getDocs, doc, getDoc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectList = document.getElementById('project-list');
    const projectListContainer = document.getElementById('project-list-container');
    const editProjectContainer = document.getElementById('edit-project-container');
    const editProjectForm = document.getElementById('edit-project-form');

    let currentProjectId = null;

    const fetchProjects = async () => {
        projectList.innerHTML = '';
        try {
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            projects.forEach(project => {
                const li = document.createElement('li');
                li.textContent = `${project.name} - ${project.customerName}`;
                li.addEventListener('click', () => editProject(project.id));
                projectList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const editProject = async (projectId) => {
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

    editProjectForm.addEventListener('submit', async (e) => {
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

    fetchProjects();
});
