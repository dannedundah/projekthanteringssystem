import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectList = document.getElementById('project-list');

    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => doc.data());

        projects.forEach(project => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="projektdetalj.html?name=${encodeURIComponent(project.name)}">${project.name}</a>`;
            projectList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching projects: ', error);
    }
});
