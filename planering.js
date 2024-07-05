import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectSelect = document.getElementById('project');
    const form = document.getElementById('planning-form');
    const employeeSelects = document.querySelectorAll('.employee-select');

    try {
        const querySnapshot = await getDocs(collection(db, "projects"));
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const project = projectSelect.value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const employees = Array.from(employeeSelects).map(select => select.value).filter(Boolean);

        if (!project || !startDate || !endDate || employees.length === 0) {
            alert('Vänligen fyll i alla fält.');
            return;
        }

        try {
            await addDoc(collection(db, "planning"), {
                project,
                startDate,
                endDate,
                employees
            });
            alert('Planering tillagd!');
            form.reset();
        } catch (error) {
            console.error('Error adding planning:', error);
        }
    });
});
