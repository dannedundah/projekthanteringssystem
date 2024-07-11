import { db, collection, getDocs, addDoc, query, where } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const timeReportForm = document.getElementById('time-report-form');
    const projectSearch = document.getElementById('project-search');
    const searchResults = document.getElementById('search-results');
    const employeeSelect = document.getElementById('employee-select');
    const exportBtn = document.getElementById('export-btn');
    let selectedProjectId = null;

    projectSearch.addEventListener('input', async () => {
        const searchTerm = projectSearch.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (searchTerm.length > 0 && employeeSelect.value) {
            try {
                const querySnapshot = await getDocs(query(collection(db, 'planning'), where('employees', 'array-contains', employeeSelect.value)));
                const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const filteredProjects = projects.filter(project => project.project.toLowerCase().includes(searchTerm));

                filteredProjects.forEach(project => {
                    const div = document.createElement('div');
                    div.textContent = project.project;
                    div.addEventListener('click', () => {
                        selectedProjectId = project.id;
                        projectSearch.value = project.project;
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
            const employee = employeeSelect.value;
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

    exportBtn.addEventListener('click', async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'timeReports'));
            const reports = querySnapshot.docs.map(doc => doc.data());

            const ws_data = [
                ["Projekt ID", "Anställd", "Typ av tid", "Antal timmar", "Datum"]
            ];

            reports.forEach(report => {
                ws_data.push([report.projectId, report.employee, report.timeType, report.hours, report.date]);
            });

            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Tidrapporter");

            XLSX.writeFile(wb, "Tidrapporter.xlsx");
        } catch (error) {
            console.error('Error exporting time reports:', error);
        }
    });

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
