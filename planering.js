import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const employeeSelect = document.getElementById('employee-select');
    const projectSelect = document.getElementById('project-select');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    employeeSelect.addEventListener('change', () => {
        const selectedEmployee = employeeSelect.value;
        if (selectedEmployee) {
            populateProjects();
        } else {
            projectSelect.innerHTML = '<option value="">Välj projekt</option>';
            startDateInput.value = '';
            endDateInput.value = '';
        }
    });

    projectSelect.addEventListener('change', () => {
        const selectedProject = projectSelect.value;
        if (selectedProject) {
            // Additional actions can be performed here if needed
        } else {
            startDateInput.value = '';
            endDateInput.value = '';
        }
    });

    async function populateProjects() {
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
    }

    window.assignProject = async () => {
        const selectedEmployee = employeeSelect.value;
        const selectedProject = projectSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (selectedEmployee && selectedProject && startDate && endDate) {
            try {
                await addDoc(collection(db, "schedules"), {
                    projectId: selectedProject,
                    name: selectedEmployee,
                    startDate: startDate,
                    endDate: endDate
                });
                alert('Projekt tilldelat!');
            } catch (error) {
                console.error('Error assigning project:', error);
            }
        } else {
            alert('Vänligen fyll i alla fält.');
        }
    };

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
