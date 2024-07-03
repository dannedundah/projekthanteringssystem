import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectSelect = document.getElementById('project');

    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});

document.getElementById('planning-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const project = document.getElementById('project').value;
    const employee1 = document.getElementById('employee-1').value;
    const employee2 = document.getElementById('employee-2').value;
    const employee3 = document.getElementById('employee-3').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (project && (employee1 || employee2 || employee3) && startDate && endDate) {
        try {
            await addDoc(collection(db, 'schedules'), {
                project,
                employees: [employee1, employee2, employee3].filter(Boolean),
                startDate,
                endDate
            });
            alert('Planeringen har lagts till.');
        } catch (error) {
            console.error('Error adding planning:', error);
        }
    } else {
        alert('Vänligen fyll i alla fält.');
    }
});
