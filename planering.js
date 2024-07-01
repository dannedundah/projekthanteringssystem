import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectSelect = document.getElementById('project-select');

    // Hämta projekt från Firestore och fyll i dropdown-menyn
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

    // Hantera formulärinsändning
    const planningForm = document.getElementById('planning-form');
    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const employees = Array.from(document.getElementById('employee-select').selectedOptions).map(option => option.value);
        const projectId = document.getElementById('project-select').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        try {
            await addDoc(collection(db, 'planning'), {
                employees,
                projectId,
                startDate,
                endDate
            });
            alert('Planeringen har lagts till!');
            planningForm.reset();
        } catch (error) {
            console.error('Error adding planning:', error);
            alert('Ett fel uppstod vid tillägg av planeringen.');
        }
    });
});
