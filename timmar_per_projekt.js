import { db, collection, query, getDocs, doc, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    let allProjects = []; // Array för att lagra alla projektdata

    // Funktion för att hämta och sammanställa totala timmar per projekt
    async function getTotalHoursPerProject() {
        const projects = {};
        const projectAddresses = {};

        try {
            const q = query(collection(db, 'timeReports'));
            const querySnapshot = await getDocs(q);

            for (const docSnapshot of querySnapshot.docs) {
                const reportData = docSnapshot.data();
                const projectId = reportData.projectId;
                const hours = parseFloat(reportData.hours) || 0;

                if (projects[projectId]) {
                    projects[projectId] += hours;
                } else {
                    projects[projectId] = hours;

                    // Hämta projektadressen endast en gång per projekt
                    const projectDoc = await getDoc(doc(db, 'projects', projectId));
                    if (projectDoc.exists()) {
                        projectAddresses[projectId] = projectDoc.data().address || "Ej specificerad";
                    } else {
                        projectAddresses[projectId] = "Ej specificerad";
                    }
                }
            }

            // Omvandla objektet till en array med adresser och totala timmar
            allProjects = Object.keys(projects).map(projectId => ({
                address: projectAddresses[projectId],
                totalHours: projects[projectId]
            }));

            return allProjects;

        } catch (error) {
            console.error("Error calculating total hours per project:", error);
        }
    }

    // Funktion för att visa filtrerade projekt baserat på söksträng
    function displayFilteredProjects(searchText = '') {
        const resultsContainer = document.getElementById('total-hours-container');
        resultsContainer.innerHTML = '';

        // Filtrera projekten baserat på inmatad söktext
        const filteredProjects = allProjects.filter(project =>
            project.address.toLowerCase().startsWith(searchText.toLowerCase())
        );

        // Visa filtrerade projekt
        filteredProjects.forEach(project => {
            const listItem = document.createElement('li');
            listItem.textContent = `Adress: ${project.address} - Totala timmar: ${project.totalHours}`;
            resultsContainer.appendChild(listItem);
        });
    }

    // Eventlistener för att visa timmar när knappen klickas
    document.getElementById('show-total-hours').addEventListener('click', async () => {
        await getTotalHoursPerProject();
        displayFilteredProjects(); // Visa alla projekt initialt
    });

    // Eventlistener för sökfältet för att filtrera projekt i realtid
    document.getElementById('project-search').addEventListener('input', (event) => {
        const searchText = event.target.value;
        displayFilteredProjects(searchText);
    });
});
