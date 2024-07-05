import { db, collection, getDocs, addDoc, doc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectDropdown = document.getElementById('project');
    const employeeDropdowns = document.querySelectorAll('.employee-dropdown');
    const planningForm = document.getElementById('planning-form');

    // Fetch projects
    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }

    // Add planning
    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedProjectId = projectDropdown.value;
        const selectedEmployees = Array.from(employeeDropdowns).map(dropdown => dropdown.value);
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        try {
            await addDoc(collection(db, 'planning'), {
                projectId: selectedProjectId,
                employees: selectedEmployees,
                startDate,
                endDate
            });
            alert('Planning added successfully!');
        } catch (error) {
            console.error('Error adding planning:', error);
        }
    });
});
