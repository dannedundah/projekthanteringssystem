import { db, collection, query, where, getDocs, doc, getDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ganttChartContainer = document.getElementById('gantt-chart');
    const employeeSelect = document.getElementById('employee-select');
    let plannings = [];
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

            // Fyll rullgardinsmenyn med anställda och "Elektriker"
            populateEmployeeSelect(plannings);

            // Rendera hela Gantt-diagrammet som standard
            renderGanttChart(plannings);

            // Lägg till en eventlistener för rullgardinsmenyn
            employeeSelect.addEventListener('change', () => {
                const selectedEmployee = employeeSelect.value;
                filterAndRenderGantt(selectedEmployee);
            });

        } catch (error) {
            console.error('Error fetching plannings:', error);
        }
    }

    function populateEmployeeSelect(plannings) {
        const employees = new Set();
        employees.add("Elektriker"); // Lägg till "Elektriker" som ett alternativ

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

        if (selectedEmployee === "Elektriker") {
            filteredPlannings = filteredPlannings.filter(planning => planning.electricianDate);
        } else if (selectedEmployee !== "") {
            filteredPlannings = filteredPlannings.filter(planning => 
                planning.employees.includes(selectedEmployee)
            );
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

        // Hämta och bearbeta data för att ladda Gantt-diagrammet
        const tasks = await Promise.all(plannings.map(async planning => {
            const projectDocRef = doc(db, 'projects', planning.projectId);
            const projectDoc = await getDoc(projectDocRef);
            if (projectDoc.exists()) {
                const projectData = projectDoc.data();
                const taskList = [{
                    id: planning.id,
                    text: projectData.address || 'Ej specificerad',
                    start_date: planning.startDate,
                    end_date: planning.endDate,
                    detailsLink: `projekt-detalj.html?id=${planning.projectId}`
                }];

                // Om elektrikerns datum finns, skapa en andra uppgift på samma rad för att representera elektrikern
                if (planning.electricianDate) {
                    taskList.push({
                        id: planning.id + '-electrician',
                        text: "Elektriker - " + projectData.address,
                        start_date: planning.electricianDate,
                        end_date: planning.electricianDate,
                        detailsLink: `projekt-detalj.html?id=${planning.projectId}`,
                        color: "#FFD700" // Färg för elektrikerns uppgift
                    });
                }

                return taskList;
            }
            return [];
        }));

        gantt.clearAll(); // Rensa tidigare laddade data
        gantt.parse({
            data: tasks.flat(), // Platta ut arrayen så att uppgifterna visas på samma nivå
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
