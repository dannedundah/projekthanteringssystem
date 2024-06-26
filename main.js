import { db, collection, getDocs, doc, updateDoc } from './firebase-config.js';

// Definiera funktionerna först
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

async function drop(event) {
    event.preventDefault();
    const projectId = event.dataTransfer.getData("text");
    const newStatus = event.target.closest('.folder').id === 'planned' ? 'Planerad' : (event.target.closest('.folder').id === 'billed' ? 'Fakturerad' : 'Ny');

    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { status: newStatus });
        location.reload();
    } catch (error) {
        console.error('Error updating project status:', error);
    }
}

function navigateTo(page) {
    window.location.href = page;
}

function displayProjectDetails(project) {
    const projectDetails = document.getElementById('project-details');
    projectDetails.innerHTML = `
        <h2>${project.name}</h2>
        <p><strong>Kundnamn:</strong> ${project.customerName}</p>
        <p><strong>Telefonnummer:</strong> ${project.customerPhone}</p>
        <p><strong>Adress:</strong> ${project.address}</p>
        <p><strong>Beskrivning:</strong> ${project.description}</p>
        <p><strong>Status:</strong> ${project.status}</p>
        <p><strong>Bilder:</strong></p>
        ${project.images ? project.images.map(img => `<img src="${img}" style="max-width:100px; margin:5px;">`).join('') : 'Inga bilder'}
    `;
}

// Tilldela funktionerna till window-objektet
window.allowDrop = allowDrop;
window.drag = drag;
window.drop = drop;
window.navigateTo = navigateTo;

document.addEventListener('DOMContentLoaded', async () => {
    const newProjects = document.getElementById('new-projects');
    const plannedProjects = document.getElementById('planned-projects');
    const billedProjects = document.getElementById('billed-projects');

    try {
        console.log('Fetching projects...');
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Projects:', projects);

        projects.forEach(project => {
            console.log('Project:', project); // Logga projekten för felsökning
            const li = document.createElement('li');
            li.innerHTML = `<strong>${project.name}</strong>`;
            li.draggable = true;
            li.id = project.id;
            li.ondragstart = drag;  // Använd funktionen drag
            li.onclick = () => displayProjectDetails(project); // Lägg till klickhändelse

            // Kontrollera status och tilldela till rätt mapp
            if (project.status === 'Ny') {
                newProjects.appendChild(li);
            } else if (project.status === 'Planerad') {
                plannedProjects.appendChild(li);
            } else if (project.status === 'Fakturerad') {
                billedProjects.appendChild(li);
            } else {
                // Om statusen är något annat, logga det
                console.log(`Project ${project.name} has an unknown status: ${project.status}`);
            }
        });

        // Logga om inga projekt hittades
        if (projects.length === 0) {
            console.log('No projects found');
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});
