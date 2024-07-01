import { db, collection, getDocs, doc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectSelect = document.getElementById('project-select');
    const employeeSelect = document.getElementById('employee-select');
    const assignProjectForm = document.getElementById('assign-project-form');

    const projects = await getProjects();
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });

    const employees = await getEmployees();
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        employeeSelect.appendChild(option);
    });

    assignProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const projectId = projectSelect.value;
        const employeeId = employeeSelect.value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, { assignedTo: employeeId, startDate: startDate, endDate: endDate });
            alert('Projekt tilldelat!');
        } catch (error) {
            console.error('Error assigning project:', error);
            alert('Ett fel uppstod vid tilldelning av projektet.');
        }
    });

    async function getProjects() {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async function getEmployees() {
        const querySnapshot = await getDocs(collection(db, 'employees'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
});
