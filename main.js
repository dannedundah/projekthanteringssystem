import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectList = document.getElementById('project-list');

    console.log('Fetching projects...');
    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Projects:', projects);

        projects.forEach(project => {
            const li = document.createElement('li');
            li.textContent = project.name;
            projectList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});

function navigateTo(page) {
    window.location.href = page;
}

window.navigateTo = navigateTo;  // Lägg till denna rad för att göra funktionen globalt tillgänglig
