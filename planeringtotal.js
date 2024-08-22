import { db, collection, query, where, getDocs, doc, getDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ganttChartContainer = document.getElementById('gantt-chart');
    const employeeSelect = document.getElementById('employee-select');
    const filterElectricianBtn = document.getElementById('filter-electrician-btn');
    let plannings = [];
    let isElectricianFilterActive = false;
    let canEdit = false;

    // Kontrollera vem som är inloggad och ladda planeringen
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                canEdit = ["daniel@delidel.se", "sofie@delidel.se", "leia@delidel.se"].includes(user.email);
                initializePage();
            } else {
                console.error('User document not found.');
            }
        } else {
            console.error('User not logged in');
            navigateTo('login.html');
        }
    });

    async function initializePage() {
        try {
            // Hämta all planering
            const querySnapshot = await getDocs(collection(db, 'planning'));
            plannings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fyll rullgardinsmenyn med anställda
            populateEmployeeSelect(plannings);

            // Rendera hela Gantt-diagrammet som standard
            renderGanttChart(plannings);

            // Lägg till en eventlistener för rullgardinsmenyn
            employeeSelect.addEventListener('change', () => {
                const selectedEmployee = employeeSelect.value;
                filterAndRenderGantt(selectedEmployee);
            });

            // Lägg till en eventlistener för filter-knappen
            filterElectricianBtn.addEventListener('click', () => {
                isElectricianFilterActive = !isElectricianFilterActive;
                filterElectricianBtn.textContent = isElectricianFilterActive
                    ? "Visa alla scheman"
                    : "Visa endast datum för elektriker";
                filterAndRenderGantt(employeeSelect.value);
            });

        } catch (error) {
            console.error('Error fetching plannings:', error);
        }
    }

    function populateEmployeeSelect(plannings) {
        const employees = new Set();
        plannings.forEach(planning => {
            planning.employees.forEach(employee => employees.add(employee));
        });

        employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee;
            option.textContent = employee;
            employeeSelect.appendChild(option);
        });
    }

    function filterAndRenderGantt(selectedEmployee) {
        let filteredPlannings = plannings;

        if (selectedEmployee !== "") {
            filteredPlannings = filteredPlannings.filter(planning => 
                planning.employees.includes(selectedEmployee)
            );
        }

        if (isElectricianFilterActive) {
            filteredPlannings = filteredPlannings.filter(planning => planning.electricianDate);
        }

        renderGanttChart(filteredPlannings);
    }

    async function renderGanttChart(plannings) {
        ganttChartContainer.innerHTML = ''; // Rensa befintligt innehåll
        
        // Konfigurera Gantt-diagrammet
        gantt.config.xml_date = "%Y-%m-%d"; // Ange datumformatet
        gantt.config.readonly = !canEdit; // Gör diagrammet redigerbart för adminanvändare

        // Initialisera Gantt-diagrammet
        gantt.init("gantt-chart");

        // Ladda data i Gantt-diagrammet
        gantt.parse({
            data: await Promise.all(plannings.map(async planning => {
                const projectDocRef = doc(db, 'projects', planning.projectId);
                const projectDoc = await getDoc(projectDocRef);
                if (projectDoc.exists()) {
                    const projectData = projectDoc.data();
                    const tasks = [{
                        id: planning.id,
                        text: projectData.address || 'Ej specificerad',
                        start_date: planning.startDate,
                        end_date: planning.endDate,
                        detailsLink: `projekt-detalj.html?id=${planning.projectId}`,
                    }];

                    // Lägg till elektrikerns datum som en separat händelse på samma rad
                    if (planning.electricianDate) {
                        tasks.push({
                            id: planning.id + '-electrician',
                            text: 'Elektriker: ' + planning.electricianDate,
                            start_date: planning.electricianDate,
                            end_date: planning.electricianDate,
                            detailsLink: `projekt-detalj.html?id=${planning.projectId}`,
                            color: "#FFD700" // Gult som skiljer sig från andra uppgifter
                        });
                    }

                    return tasks;
                }
                return null;
            }).flat()), // Platta ut arrayen så att uppgifterna visas på samma nivå
            links: []
        });

        // Lägg till en klickhändelse på varje uppgift
        gantt.attachEvent("onTaskClick", function(id, e) {
            const task = gantt.getTask(id);
            if (task && task.detailsLink) {
                window.location.href = task.detailsLink;
            }
            return true;
        });
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
