import { db, collection, query, where, getDocs, doc, getDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ganttChartContainer = document.getElementById('gantt-chart');
    const employeeSelect = document.getElementById('employee-select');
    let plannings = [];

    // Kontrollera vem som är inloggad och ladda planeringen
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
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
        if (selectedEmployee === "") {
            // Visa alla anställdas schema
            renderGanttChart(plannings);
        } else {
            // Filtrera planeringen för att bara visa den valda anställdas schema
            const filteredPlannings = plannings.filter(planning => 
                planning.employees.includes(selectedEmployee)
            );
            renderGanttChart(filteredPlannings);
        }
    }

    async function renderGanttChart(plannings) {
        ganttChartContainer.innerHTML = ''; // Rensa befintligt innehåll
        
        // Konfigurera Gantt-diagrammet
        gantt.config.xml_date = "%Y-%m-%d"; // Ange datumformatet

        // Gör Gantt-diagrammet read-only
        gantt.config.readonly = true;

        // Initialisera Gantt-diagrammet
        gantt.init("gantt-chart");

        // Ladda data i Gantt-diagrammet
        gantt.parse({
            data: await Promise.all(plannings.map(async planning => {
                const projectDocRef = doc(db, 'projects', planning.projectId);
                const projectDoc = await getDoc(projectDocRef);
                if (projectDoc.exists()) {
                    const projectData = projectDoc.data();
                    return {
                        id: planning.id,
                        text: `${projectData.address || 'Ej specificerad'} (Elektriker: ${planning.electricianDate || 'Ej specificerad'})`,
                        start_date: planning.startDate,
                        end_date: planning.endDate,
                        detailsLink: `projekt-detalj.html?id=${planning.projectId}`,
                    };
                }
                return null;
            })),
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
