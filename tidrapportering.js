import { db, collection, query, where, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const timeReportForm = document.getElementById('time-report-form');
    const projectSearch = document.getElementById('project-search');
    const searchResults = document.getElementById('search-results');
    const employeeDropdown = document.getElementById('employee-dropdown');
    let selectedProjectId = null;

    // Event listener for project search input
    projectSearch.addEventListener('input', async () => {
        const searchTerm = projectSearch?.value?.trim().toLowerCase() || '';
        searchResults.innerHTML = '';

        // Get selected employee
        const selectedEmployee = employeeDropdown?.value;
        if (!selectedEmployee) {
            alert('Vänligen välj en anställd.');
            return;
        }

        if (searchTerm.length > 0) {
            try {
                const q = query(collection(db, 'projects'), where('assignedEmployees', 'array-contains', selectedEmployee));
                const querySnapshot = await getDocs(q);
                const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const filteredProjects = projects.filter(project => project.address.toLowerCase().includes(searchTerm));

                filteredProjects.forEach(project => {
                    const div = document.createElement('div');
                    div.textContent = project.address;
                    div.addEventListener('click', () => {
                        selectedProjectId = project.id;
                        projectSearch.value = project.address;
                        searchResults.innerHTML = '';
                    });
                    searchResults.appendChild(div);
                });
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        }
    });

    // Event listener for form submission
    timeReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedEmployee = employeeDropdown?.value;
        if (!selectedEmployee) {
            alert('Vänligen välj en anställd.');
            return;
        }

        if (selectedProjectId) {
            const timeType = document.getElementById('time-type')?.value || '';
            const hours = document.getElementById('hours')?.value || '';
            const date = document.getElementById('date')?.value || '';

            if (timeType && hours && date) {
                const timeReport = {
                    projectId: selectedProjectId,
                    employee: selectedEmployee,
                    timeType,
                    hours: parseFloat(hours),
                    date,
                };

                try {
                    await addDoc(collection(db, 'timeReports'), timeReport);
                    alert('Tidrapporten har sparats!');
                    timeReportForm.reset();
                    selectedProjectId = null;
                } catch (error) {
                    console.error('Error adding time report:', error);
                    alert('Ett fel uppstod vid sparandet av tidrapporten.');
                }
            } else {
                alert('Vänligen fyll i alla fält.');
            }
        } else {
            alert('Vänligen välj ett projekt.');
        }
    });

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
