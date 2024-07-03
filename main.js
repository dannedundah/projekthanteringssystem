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

    document.querySelectorAll('.project-category h3').forEach(header => {
        header.onclick = () => {
            const ul = header.nextElementSibling;
            ul.classList.toggle('show');
        };
    });
});

function showProjectDetails(projectId) {
    window.location.href = `projekt-detalj.html?id=${projectId}`;
}
