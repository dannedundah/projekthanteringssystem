import { db, collection, getDocs, updateDoc, doc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const employeeSelect = document.getElementById('employee-select');
    const ganttBody = document.getElementById('gantt-body');

    // Hämta anställda
    const employees = await getEmployees();
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        employeeSelect.appendChild(option);
    });

    // Hämta projekt
    const projects = await getProjects();
    renderGanttChart(projects);

    employeeSelect.addEventListener('change', () => {
        const selectedEmployeeId = employeeSelect.value;
        const filteredProjects = projects.filter(project => project.assignedTo === selectedEmployeeId);
        renderGanttChart(filteredProjects);
    });

    async function getEmployees() {
        const querySnapshot = await getDocs(collection(db, 'employees'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async function getProjects() {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    function renderGanttChart(projects) {
        ganttBody.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const column = document.createElement('div');
            column.classList.add('gantt-column');
            projects.forEach(project => {
                const task = document.createElement('div');
                task.classList.add('gantt-task');
                task.textContent = project.name;
                task.draggable = true;
                task.ondragstart = (event) => {
                    event.dataTransfer.setData('text', project.id);
                };
                column.appendChild(task);
            });
            ganttBody.appendChild(column);
        }
    }

    ganttBody.ondrop = (event) => {
        event.preventDefault();
        const projectId = event.dataTransfer.getData('text');
        const project = projects.find(project => project.id === projectId);
        const newEmployeeId = employeeSelect.value;

        if (project && newEmployeeId) {
            updateProjectAssignment(projectId, newEmployeeId);
        }
    };

    ganttBody.ondragover = (event) => {
        event.preventDefault();
    };

    async function updateProjectAssignment(projectId, newEmployeeId) {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, { assignedTo: newEmployeeId });
            console.log(`Project ${projectId} assigned to ${newEmployeeId}`);
        } catch (error) {
            console.error('Error updating project assignment:', error);
        }
    }
});
