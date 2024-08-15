import { db, collection, getDocs, updateDoc, doc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const newProjects = document.getElementById('new-projects');
    const plannedProjects = document.getElementById('planned-projects');
    const billedProjects = document.getElementById('billed-projects');

    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Projects:', projects);

        projects.forEach(project => {
            console.log(`Project ID: ${project.id}, Status: ${project.status}`);

            const li = document.createElement('li');
            li.id = project.id;
            li.textContent = project.name;
            li.onclick = () => navigateToProjectDetail(project.id);
            li.classList.add('project-item');

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
                case 'elektriker klar':
                    // Du kan hantera detta om du vill lista dessa separat
                    break;
                default:
                    console.warn(`Projekt med ID ${project.id} har okänd status: ${project.status}`);
            }
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});

function searchProjects() {
    const input = document.getElementById('search-input').value.toLowerCase();
    const projectItems = document.querySelectorAll('.project-item');

    projectItems.forEach(item => {
        if (item.textContent.toLowerCase().includes(input)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function toggleCategory(categoryId) {
    const categoryList = document.getElementById(categoryId);
    if (categoryList.style.display === 'none') {
        categoryList.style.display = 'block';
    } else {
        categoryList.style.display = 'none';
    }
}

function navigateToProjectDetail(projectId) {
    window.location.href = `projekt-detalj.html?id=${projectId}`;
}
