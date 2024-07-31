import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const timeReportForm = document.getElementById('time-report-form');
    const projectSearch = document.getElementById('project-search');
    const searchResults = document.getElementById('search-results');
    let selectedProjectId = null;

    projectSearch.addEventListener('input', async () => {
        const searchTerm = projectSearch.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (searchTerm.length > 0) {
            try {
                const querySnapshot = await getDocs(collection(db, 'projects'));
                const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const filteredProjects = projects.filter(project => {
                    return typeof project.address === 'string' && project.address.toLowerCase().includes(searchTerm);
                });

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
            const employee = document.getElementById('employee').value; // New field for selecting the employee
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

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
