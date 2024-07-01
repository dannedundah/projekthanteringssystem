import { db, collection, getDocs, updateDoc, doc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const employeeSelect = document.getElementById('employee-select');
    const projectsContainer = document.getElementById('projects');

    employeeSelect.addEventListener('change', () => {
        const selectedEmployee = employeeSelect.value;
        if (selectedEmployee) {
            showProjects(selectedEmployee);
        } else {
            projectsContainer.innerHTML = '';
        }
    });

    async function showProjects(employeeName) {
        try {
            const querySnapshot = await getDocs(collection(db, "projects"));
            const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            projectsContainer.innerHTML = '';
            if (projects.length > 0) {
                projects.forEach(project => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <h3>${project.name}</h3>
                        <p><strong>Kund:</strong> ${project.customerName}</p>
                        <p><strong>Beskrivning:</strong> ${project.description}</p>
                        <label for="start-date-${project.id}">Startdatum:</label>
                        <input type="date" id="start-date-${project.id}">
                        <label for="end-date-${project.id}">Slutdatum:</label>
                        <input type="date" id="end-date-${project.id}">
                        <button onclick="assignProject('${project.id}', '${employeeName}')">Tilldela</button>
                    `;
                    projectsContainer.appendChild(div);
                });
            } else {
                projectsContainer.textContent = 'Inga projekt hittades.';
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    async function assignProject(projectId, employeeName) {
        const startDate = document.getElementById(`start-date-${projectId}`).value;
        const endDate = document.getElementById(`end-date-${projectId}`).value;

        if (startDate && endDate) {
            try {
                const scheduleRef = doc(collection(db, "schedules"));
                await updateDoc(scheduleRef, {
                    projectId: projectId,
                    name: employeeName,
                    startDate: startDate,
                    endDate: endDate
                });
                alert('Projekt tilldelat!');
            } catch (error) {
                console.error('Error assigning project:', error);
            }
        } else {
            alert('Vänligen fyll i både startdatum och slutdatum.');
        }
    }

    function navigateTo(page) {
        window.location.href = page;
    }
});
