import { db, collection, addDoc, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectSelect = document.getElementById('project-select');
    const employeeSelect1 = document.getElementById('employee-select1');
    const employeeSelect2 = document.getElementById('employee-select2');
    const employeeSelect3 = document.getElementById('employee-select3');

    const employees = ['Marcus', 'Noah', 'Hampus', 'Loa', 'Alireza', 'Reza', 'Andreas', 'Rickard', 'Mustafa'];

    // Populate employee dropdowns
    employees.forEach(employee => {
        const option1 = document.createElement('option');
        option1.value = employee;
        option1.textContent = employee;
        employeeSelect1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = employee;
        option2.textContent = employee;
        employeeSelect2.appendChild(option2);

        const option3 = document.createElement('option');
        option3.value = employee;
        option3.textContent = employee;
        employeeSelect3.appendChild(option3);
    });

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

    const planningForm = document.getElementById('planning-form');

    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedProjectId = projectSelect.value;
        const selectedEmployee1 = employeeSelect1.value;
        const selectedEmployee2 = employeeSelect2.value;
        const selectedEmployee3 = employeeSelect3.value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        const employeesAssigned = [selectedEmployee1, selectedEmployee2, selectedEmployee3].filter(name => name !== 'Välj namn');

        const planning = {
            projectId: selectedProjectId,
            employees: employeesAssigned,
            startDate: startDate,
            endDate: endDate
        };

        try {
            await addDoc(collection(db, 'planning'), planning);
            alert('Planering tillagd!');
        } catch (error) {
            console.error('Error adding planning:', error);
            alert('Ett fel uppstod vid tillägg av planeringen.');
        }
    });
});
