import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectSelect = document.getElementById('project');
    const employeeSelect1 = document.getElementById('employee1');
    const employeeSelect2 = document.getElementById('employee2');
    const employeeSelect3 = document.getElementById('employee3');
    const planningForm = document.getElementById('planning-form');

    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        projectSelect.innerHTML = '<option value="">Välj projekt</option>';
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
        const projectId = projectSelect.value;
        const employee1 = employeeSelect1.value;
        const employee2 = employeeSelect2.value;
        const employee3 = employeeSelect3.value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (projectId && startDate && endDate && (employee1 || employee2 || employee3)) {
            try {
                const planning = {
                    projectId,
                    employees: [employee1, employee2, employee3].filter(Boolean),
                    startDate,
                    endDate
                };
                await addDoc(collection(db, 'schedules'), planning);
                alert('Planeringen har lagts till!');
                planningForm.reset();
            } catch (error) {
                console.error('Error adding planning:', error);
            }
        } else {
            alert('Vänligen fyll i alla obligatoriska fält.');
        }
    });
});
