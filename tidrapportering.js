import { db, collection, getDocs, addDoc, query, where } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const timeReportForm = document.getElementById('time-report-form');
    const projectSearch = document.getElementById('project-search');
    const searchResults = document.getElementById('search-results');
    const employeeDropdown = document.getElementById('employee-name'); // Make sure this element exists
    let selectedProjectId = null;

    projectSearch.addEventListener('input', async () => {
        const searchTerm = projectSearch.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (searchTerm.length > 0) {
            try {
                const employeeName = employeeDropdown.value; // Get the selected employee name
                const q = query(collection(db, 'planning'), where('employees', 'array-contains', employeeName));
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

    timeReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (selectedProjectId) {
            const timeType = document.getElementById('time-type').value;
            const hours = document.getElementById('hours').value;
            const date = document.getElementById('date').value;

            if (!timeType || !hours || !date) {
                alert('Alla fält måste fyllas i.');
                return;
            }

            const timeReport = {
                projectId: selectedProjectId,
                employee: employeeDropdown.value,
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
            alert('Vänligen välj ett projekt.');
        }
    });

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
