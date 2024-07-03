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

function searchProjects() {
    const input = document.getElementById('search-input');
    const filter = input.value.toLowerCase();
    const projectLists = document.getElementsByClassName('project-list');

    for (let i = 0; i < projectLists.length; i++) {
        const items = projectLists[i].getElementsByTagName('li');
        for (let j = 0; j < items.length; j++) {
            const txtValue = items[j].textContent || items[j].innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                items[j].style.display = '';
            } else {
                items[j].style.display = 'none';
            }
        }
    }
}

function toggleVisibility(listId) {
    const list = document.getElementById(listId);
    if (list.style.display === 'none') {
        list.style.display = 'block';
    } else {
        list.style.display = 'none';
    }
}
