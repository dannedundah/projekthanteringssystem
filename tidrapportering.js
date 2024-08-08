import { db, collection, query, where, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const timeReportForm = document.getElementById('time-report-form');
    const projectSearch = document.getElementById('project-search');
    const searchResults = document.getElementById('search-results');
    const employeeSelect = document.getElementById('employee-select');
    let selectedProjectId = null;

    projectSearch.addEventListener('input', async () => {
        const searchTerm = projectSearch.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (searchTerm.length > 0) {
            const selectedEmployee = employeeSelect.value;
            if (selectedEmployee) {
                try {
                    // Fetching projects from the schedule collection for the selected employee
                    const q = query(collection(db, 'planning'), where('employees', 'array-contains', selectedEmployee));
                    const querySnapshot = await getDocs(q);
                    const planningEntries = querySnapshot.docs.map(doc => doc.data());

                    const projectIds = planningEntries.map(entry => entry.project);

                    // Fetch projects that match the project IDs from the planning collection
                    const projectQuery = query(collection(db, 'projects'), where('id', 'in', projectIds));
                    const projectSnapshot = await getDocs(projectQuery);
                    const projects = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
            } else {
                alert('Vänligen välj en anställd.');
            }
        }
    });

    timeReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (selectedProjectId) {
            const timeType = document.getElementById('time-type').value;
            const hours = document.getElementById('hours').value;
            const date = document.getElementById('date').value;

            if (timeType && hours && date) {
                const timeReport = {
                    projectId: selectedProjectId,
                    employee: employeeSelect.value,
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
