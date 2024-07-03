import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectSelect = document.getElementById('project-select');

    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Projects:', projects);

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

    const project = document.getElementById('project-select').value;
    const employee1 = document.getElementById('employee-select-1').value;
    const employee2 = document.getElementById('employee-select-2').value;
    const employee3 = document.getElementById('employee-select-3').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    try {
        const planning = {
            project,
            employees: [employee1, employee2, employee3],
            startDate,
            endDate
        };

        await addDoc(collection(db, 'planning'), planning);
        alert('Planering tillagd!');
        window.location.reload();
    } catch (error) {
        console.error('Error adding planning:', error);
    }
});
