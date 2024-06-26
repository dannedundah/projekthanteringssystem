import { db, collection, getDocs, updateDoc, doc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const newProjects = document.getElementById('new-projects');
    const plannedProjects = document.getElementById('planned-projects');
    const billedProjects = document.getElementById('billed-projects');

    console.log('Fetching projects...');
    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Projects:', projects);

        projects.forEach(project => {
            const li = document.createElement('li');
            li.id = project.id;
            li.draggable = true;
            li.ondragstart = drag;
            li.onclick = () => showProjectDetails(project.id);
            li.textContent = project.name;

            switch (project.status) {
                case 'Ny':
                    newProjects.appendChild(li);
                    break;
                case 'Planerad':
                    plannedProjects.appendChild(li);
                    break;
                case 'Fakturerad':
                    billedProjects.appendChild(li);
                    break;
            }
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});

function showProjectDetails(projectId) {
    window.location.href = `projekt-detalj.html?id=${projectId}`;
}

window.allowDrop = function(event) {
    event.preventDefault();
}

window.drag = function(event) {
    event.dataTransfer.setData("text", event.target.id);
}

window.drop = function(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const projectElement = document.getElementById(data);
    const newCategory = event.target.closest('ul').id.split('-')[0];
    event.target.appendChild(projectElement);
    updateProjectCategory(projectElement.id, newCategory);
}

async function updateProjectCategory(projectId, newCategory) {
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { status: newCategory });
        console.log(`Project ${projectId} updated to ${newCategory}`);
    } catch (error) {
        console.error('Error updating project category:', error);
    }
}
