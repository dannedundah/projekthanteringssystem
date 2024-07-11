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

            const timeReport =To push your updated code to GitHub and ensure the necessary functionalities, including exporting timesheets to Excel, follow the steps below. This includes integrating the Excel export feature and ensuring everything is ready for deployment.

### Step 1: Update Your Code

Ensure all your files are up-to-date and include the new functionality.

### Full `tidrapportering.html` File

Add the `xlsx` library and the export button to the HTML file.

```html
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tidrapportering</title>
    <link rel="stylesheet" href="style.css">
    <script type="module" src="firebase-config.js"></script>
    <script type="module" src="tidrapportering.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.9/xlsx.full.min.js"></script>
</head>
<body>
    <div class="container">
        <h1>Tidrapportering</h1>
        <form id="time-report-form">
            <label for="employee-select">Anställd:</label>
            <select id="employee-select" required>
                <option value="">Välj namn</option>
                <option value="Alireza">Alireza</option>
                <option value="Andreas">Andreas</option>
                <option value="Daniel">Daniel</option>
                <option value="Hampus">Hampus</option>
                <option value="Loa">Loa</option>
                <option value="Marcus">Marcus</option>
                <option value="Mustafa">Mustafa</option>
                <option value="Noah">Noah</option>
                <option value="Reza">Reza</option>
                <option value="Rickard">Rickard</option>
            </select>

            <label for="project-search">Sök projekt:</label>
            <input type="text" id="project-search" placeholder="Sök projekt">
            <div id="search-results"></div>

            <label for="time-type">Typ av tid:</label>
            <select id="time-type" required>
                <option value="Normal tid">Normal tid</option>
                <option value="Sjuk">Sjuk</option>
                <option value="Semester">Semester</option>
                <option value="VAB">VAB</option>
                <option value="Obetald tjänstledighet">Obetald tjänstledighet</option>
                <option value="Permission">Permission</option>
            </select>

            <label for="hours">Antal timmar:</label>
            <input type="number" id="hours" step="0.1" required>

            <label for="date">Datum:</label>
            <input type="date" id="date" required>

            <button type="submit">Rapportera tid</button>
        </form>
        <button id="export-btn">Exportera till Excel</button>
        <button onclick="navigateTo('index.html')">Tillbaka</button>
    </div>
</body>
</html>
