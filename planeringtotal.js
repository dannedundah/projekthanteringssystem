import { db, collection, getDocs, doc, getDoc, auth, onAuthStateChanged } from './firebase-config.js';

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

        renderGanttChart(filteredPlannings, selectedEmployee === "Elektriker");
    }

    function formatDateToString(date) {
        if (!date) {
            console.error("Invalid date:", date);
            return null;
        }
        
        if (date.seconds) {
            const d = new Date(date.seconds * 1000);
            return d.toISOString().split('T')[0];
        }

        if (typeof date === 'string') {
            return date;
        }

        const d = new Date(date);
        if (isNaN(d)) {
            console.error("Invalid date:", date);
            return null;
        }
        return d.toISOString().split('T')[0];
    }

    function adjustEndDateForSingleDay(startDate, endDate) {
        if (startDate === endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            return end.toISOString().split('T')[0];
        }
        return endDate;
    }

    async function renderGanttChart(plannings, isElectricianView = false) {
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

                if (isElectricianView) {
                    const startDate = formatDateToString(planning.electricianStartDate);
                    let endDate = formatDateToString(planning.electricianEndDate);

                    if (!startDate || !endDate) {
                        console.error("Invalid start or end date for planning:", planning);
                        return [];
                    }

                    endDate = adjustEndDateForSingleDay(startDate, endDate);

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
                    let endDate = formatDateToString(planning.endDate);

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
            if (e.target.closest('.gantt_cell')) {
                window.location.href = task.detailsLink;
                return false;
            }
            return true;
        });
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
