import { db, collection, getDocs } from './firebase-config.js';

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

        window.projects = projects; // Make projects available globally for search
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});

function showProjectDetails(projectId) {
    window.location.href = `projekt-detalj.html?id=${projectId}`;
}

window.toggleCategory = function toggleCategory(categoryId) {
    const category = document.getElementById(categoryId);
    category.classList.toggle('show');
};

window.searchProjects = function searchProjects() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const projects = window.projects;

    const filteredProjects = projects.filter(project => project.name.toLowerCase().includes(searchInput));

    document.getElementById('new-projects').innerHTML = '';
    document.getElementById('planned-projects').innerHTML = '';
    document.getElementById('billed-projects').innerHTML = '';

    filteredProjects.forEach(project => {
        const li = document.createElement('li');
        li.id = project.id;
        li.onclick = () => showProjectDetails(project.id);
        li.textContent = project.name;

        switch (project.status) {
            case 'Ny':
                document.getElementById('new-projects').appendChild(li);
                break;
            case 'Planerad':
                document.getElementById('planned-projects').appendChild(li);
                break;
            case 'Fakturerad':
                document.getElementById('billed-projects').appendChild(li);
                break;
        }
    });
}
