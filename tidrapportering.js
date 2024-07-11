import { db, collection, getDocs, addDoc, query, where } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const timeReportForm = document.getElementById('time-report-form');
    const projectSearch = document.getElementById('project-search');
    const searchResults = document.getElementById('search-results');
    const employeeSelect = document.getElementById('employee-select');
    let selectedProjectId = null;

    employeeSelect.addEventListener('change', async () => {
        const employeeName = employeeSelect.value;
        if (employeeName) {
            await updateProjectSearch(employeeName);
        }
    });

    projectSearch.addEventListener('input', async () => {
        const searchTerm = projectSearch.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (searchTerm.length > 0 && employeeSelect.value) {
            try {
                const querySnapshot = await getDocs(collection(db, 'projects'));
                const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const filteredProjects = projects.filter(project => project.name.toLowerCase().includes(searchTerm));

                filteredProjects.forEach(project => {
                    const div = document.createElement('div');
                    div.textContent = project.name;
                    div.addEventListener('click', () => {
                        selectedProjectId = project.id;
                        projectSearch.value = project.name;
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
            const employee = document.getElementById('employee-select').value;
            const timeType = document.getElementById('time-type').value;
            const hours = document.getElementById('hours').value;
            const date = document.getElementById('date').value;

            const timeReport = {
                projectId: selectedProjectId,
                employee,
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

    async function updateProjectSearch(employeeName) {
        try {
            const scheduleQuery = query(collection(db, 'schedules'), where('employees', 'array-contains', employeeName));
            const querySnapshot = await getDocs(scheduleQuery);
            const schedules = querySnapshot.docs.map(doc => doc.data());

            if (schedules.length > 0) {
                projectSearch.disabled = false;
            } else {
                projectSearch.disabled = true;
                searchResults.innerHTML = '<div>Inga scheman hittades för denna anställd.</div>';
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            projectSearch.disabled = true;
            searchResults.innerHTML = '<div>Fel vid hämtning av scheman.</div>';
        }
    }

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
