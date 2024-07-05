import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectSelect = document.getElementById('project-select');
    const planningForm = document.getElementById('planning-form');

    // Fetch and populate projects
    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        querySnapshot.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data().name;
            projectSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }

    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const project = projectSelect.value;
        const employee1 = document.getElementById('employee-select-1').value;
        const employee2 = document.getElementById('employee-select-2').value;
        const employee3 = document.getElementById('employee-select-3').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (project && startDate && endDate) {
            try {
                await addDoc(collection(db, 'planning'), {
                    project,
                    employees: [employee1, employee2, employee3],
                    startDate,
                    endDate
                });
                alert('Planering tillagd');
                planningForm.reset();
            } catch (error) {
                console.error('Error adding planning:', error);
            }
        }
    });
});
