import { db, collection, getDocs, doc, getDoc, updateDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ganttChartContainer = document.getElementById('gantt-chart');
    const employeeSelect = document.getElementById('employee-select');
    let plannings = [];
    let canEdit = false;

    const hiddenProjectId = "moBgPPK2jgyZaeBnqza1";

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
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
        // Ta bort DHTMLX Gantt-modalen från DOM
        const ganttModals = document.querySelectorAll('.gantt_cal_light, .gantt_cal_cover');
        ganttModals.forEach(modal => modal.remove());

        try {
            const querySnapshot = await getDocs(collection(db, 'planning'));
            plannings = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(planning => planning.projectId !== hiddenProjectId);

            populateEmployeeSelect(plannings);
            renderGanttChart(plannings);

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
        employees.add("Elektriker");

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
        let filteredPlannings = [];

        if (selectedEmployee === "Elektriker") {
            filteredPlannings = plannings.filter(planning => 
                planning.electricianStartDate && 
                planning.electricianEndDate && 
                planning.projectId !== hiddenProjectId
            );
        } else if (selectedEmployee === "") {
            filteredPlannings = plannings.filter(planning => planning.projectId !== hiddenProjectId);
        } else {
            filteredPlannings = plannings.filter(planning => 
                planning.employees.includes(selectedEmployee) && 
                planning.projectId !== hiddenProjectId
            );
        }

        renderGanttChart(filteredPlannings);
    }

    function formatDateToString(date) {
        if (!date) {
            console.error("Invalid date:", date);
            return null;
        }
        
        // Hanterar Firebase Timestamp-objekt
        if (date.seconds) {
            const d = new Date(date.seconds * 1000); // Konvertera från sekunder till millisekunder
            return d.toISOString().split('T')[0]; // Returnera i formatet "YYYY-MM-DD"
        }

        // Om datum redan är en sträng i korrekt format
        if (typeof date === 'string') {
            return date;
        }

        // Hantera vanliga Date-objekt
        const d = new Date(date);
        if (isNaN(d)) {
            console.error("Invalid date:", date);
            return null;
        }
        return d.toISOString().split('T')[0];
    }

    async function renderGanttChart(plannings) {
        ganttChartContainer.innerHTML = '';

        gantt.config.xml_date = "%Y-%m-%d";
        gantt.config.readonly = !canEdit;

        gantt.init("gantt-chart");

        const tasks = await Promise.all(plannings.map(async planning => {
            const projectDocRef = doc(db, 'projects', planning.projectId);
            const projectDoc = await getDoc(projectDocRef);
            if (projectDoc.exists()) {
                const projectData = projectDoc.data();
                const taskList = [];

                if (employeeSelect.value === "Elektriker") {
                    const startDate = formatDateToString(planning.electricianStartDate);
                    const endDate = formatDateToString(planning.electricianEndDate);

                    if (!startDate || !endDate) {
                        console.error("Invalid start or end date for planning:", planning);
                        return [];
                    }

                    taskList.push({
                        id: planning.id + '-electrician',
                        text: projectData.address || 'Ej specificerad',
                        start_date: startDate,
                        end_date: endDate,
                        detailsLink: `projekt-detalj.html?id=${planning.projectId}`,
                        color: "#FFD700"
                    });
                } else {
                    const startDate = formatDateToString(planning.startDate);
                    const endDate = formatDateToString(planning.endDate);

                    if (!startDate || !endDate) {
                        console.error("Invalid start or end date for planning:", planning);
                        return [];
                    }

                    taskList.push({
                        id: planning.id,
                        text: projectData.address || 'Ej specificerad',
                        start_date: startDate,
                        end_date: endDate,
                        detailsLink: `projekt-detalj.html?id=${planning.projectId}`
                    });
                }

                return taskList;
            }
            return [];
        }));

        gantt.clearAll();
        gantt.parse({
            data: tasks.flat(),
            links: []
        });

        gantt.attachEvent("onTaskClick", function(id, e) {
            const task = gantt.getTask(id);
            if (e.target.closest('.gantt_row_task')) {
                // Förhindra navigering när man klickar på högersidan (Gantt-diagrammet)
                return false;
            } else if (e.target.closest('.gantt_cell')) {
                // Tillåt navigering från vänsterkolumnen (trädet)
                window.location.href = task.detailsLink;
                return false;
            }
        });
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
