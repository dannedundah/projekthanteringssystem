import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectSelect = document.getElementById('project-select');
    const employeeSelects = document.querySelectorAll('.employee-select');

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

    document.getElementById('planning-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedProject = projectSelect.value;
        const selectedEmployees = Array.from(employeeSelects).map(select => select.value);
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        try {
            await addDoc(collection(db, 'planning'), {
                projectId: selectedProject,
                employees: selectedEmployees,
                startDate,
                endDate
            });
            alert('Planeringen har lagts till!');
        } catch (error) {
            console.error('Error adding planning:', error);
            alert('Ett fel uppstod vid tillägg av planering.');
        }
    });
});
