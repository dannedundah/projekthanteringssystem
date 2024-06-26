import { db, collection, getDocs, doc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const plannedProjects = document.getElementById('planned-projects');
    const billedProjects = document.getElementById('billed-projects');

    try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        projects.forEach(project => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${project.name}</strong>`;
            li.draggable = true;
            li.id = project.id;
            li.ondragstart = drag;

            if (project.status === 'Planerad') {
                plannedProjects.appendChild(li);
            } else if (project.status === 'Fakturerad') {
                billedProjects.appendChild(li);
            }
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }

    window.allowDrop = (event) => {
        event.preventDefault();
    };

    window.drag = (event) => {
        event.dataTransfer.setData("text", event.target.id);
    };

    window.drop = async (event) => {
        event.preventDefault();
        const projectId = event.dataTransfer.getData("text");
        const newStatus = event.target.closest('.folder').id === 'planned' ? 'Planerad' : 'Fakturerad';

        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, { status: newStatus });
            location.reload();
        } catch (error) {
            console.error('Error updating project status:', error);
        }
    };

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
