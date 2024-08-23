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
                    const startDate = new Date(planning.electricianStartDate);
                    const endDate = new Date(planning.electricianEndDate);

                    if (startDate.getTime() === endDate.getTime()) {
                        endDate.setDate(endDate.getDate() + 1);
                    }

                    taskList.push({
                        id: planning.id + '-electrician',
                        text: projectData.address || 'Ej specificerad',
                        start_date: planning.electricianStartDate,
                        end_date: endDate.toISOString().split('T')[0],
                        detailsLink: `projekt-detalj.html?id=${planning.projectId}`,
                        color: "#FFD700"
                    });
                } else {
                    taskList.push({
                        id: planning.id,
                        text: projectData.address || 'Ej specificerad',
                        start_date: planning.startDate,
                        end_date: planning.endDate,
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

        if (canEdit) {
            gantt.attachEvent("onTaskClick", function(id, e) {
                const task = gantt.getTask(id);
                console.log("task clicked"); // Felsökningslogg
                if (e.target.closest('.gantt_task_row')) {
                    showEditModal(task);
                    return false;
                }
                if (e.target.closest('.gantt_tree_content')) {
                    window.location.href = task.detailsLink;
                    return false;
                }
            });
        } else {
            gantt.attachEvent("onTaskClick", function(id, e) {
                if (e.target.closest('.gantt_tree_content')) {
                    const task = gantt.getTask(id);
                    window.location.href = task.detailsLink;
                    return false;
                }
            });
        }
    }

    function showEditModal(task) {
        console.log('showEditModal called:', task); // Kontrollera att denna logg syns
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Ändra Datum</h3>
                <label for="start-date">Startdatum:</label>
                <input type="date" id="start-date" value="${task.start_date}">
                <label for="end-date">Slutdatum:</label>
                <input type="date" id="end-date" value="${task.end_date}">
                <div class="modal-footer">
                    <button class="save-button" onclick="saveTaskDates('${task.id}')">Spara</button>
                    <button class="cancel-button" onclick="this.parentElement.parentElement.parentElement.remove()">Avbryt</button>
                </div>
            </div>
        `;
        setTimeout(() => {
            document.body.appendChild(modal);
            console.log('Modal added to DOM:', document.querySelector('.modal')); // Kontrollera att denna logg syns
        }, 100); // 100ms fördröjning
    }

    async function saveTaskDates(taskId) {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        const planningRef = doc(db, 'planning', taskId.replace('-electrician', ''));
        await updateDoc(planningRef, {
            startDate: startDate,
            endDate: endDate
        });

        gantt.getTask(taskId).start_date = startDate;
        gantt.getTask(taskId).end_date = endDate;
        gantt.updateTask(taskId);

        document.querySelector('.modal').remove();
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
