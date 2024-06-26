import { getProjects } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectList = document.getElementById('project-list');
    const projects = await getProjects();

    projects.forEach(project => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="projektdetalj.html?name=${encodeURIComponent(project.name)}">${project.name}</a>`;
        projectList.appendChild(li);
    });
});
