import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const planningForm = document.getElementById('planning-form');
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

    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedProject = projectSelect.value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const employees = [
            document.getElementById('employee1').value,
            document.getElementById('employee2').value,
            document.getElementById('employee3').value
        ].filter(employee => employee !== "");

        if (!selectedProject || !startDate || !endDate || employees.length === 0) {
            alert('Vänligen fyll i alla fält.');
            return;
        }

        const planning = {
            project: selectedProject,
            startDate,
            endDate,
            employees
        };

        try {
            await addDoc(collection(db, 'planning'), planning);
            alert('Planeringen har lagts till!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error adding planning:', error);
            alert('Ett fel uppstod vid tillägg av planeringen.');
        }
    });
});

function navigateTo(page) {
    window.location.href = page;
}
