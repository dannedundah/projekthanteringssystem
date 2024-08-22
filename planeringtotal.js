import { db, collection, getDocs, doc, getDoc, updateDoc, auth, onAuthStateChanged } from './firebase-config.js';

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
        let filteredPlannings = [];

        if (selectedEmployee === "Elektriker") {
            // Om Elektriker är vald, visa endast projekten för elektrikern och inte intern tid
            filteredPlannings = plannings.filter(planning => 
                planning.electricianStartDate && 
                planning.electricianEndDate && 
                planning.projectId !== hiddenProjectId
            );
        } else if (selectedEmployee === "") {
            // Visa alla projekt utan elektrikerns datum och intern tid
            filteredPlannings = plannings.filter(planning => planning.projectId !== hiddenProjectId);
        } else {
            // Filtrera efter specifik anställd och dölja intern tid
            filteredPlannings = plannings.filter(planning => 
                planning.employees.includes(selectedEmployee) && 
                planning.projectId !== hiddenProjectId
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
                showEditModal(task);
                return false; 
            });
        }
    }

    function showEditModal(task) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Uppdatera Projekt: ${task.text}</h3>
                <label for="start-date">Startdatum:</label>
                <input type="date" id="start-date" value="${task.start_date}">
                <label for="end-date">Slutdatum:</label>
                <input type="date" id="end-date" value="${task.end_date}">
                <button onclick="saveTaskDates('${task.id}')">Spara</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async function saveTaskDates(taskId) {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        // Uppdatera Firestore
        const planningRef = doc(db, 'planning', taskId.replace('-electrician', ''));
        await updateDoc(planningRef, {
            startDate: startDate,
            endDate: endDate
        });

        // Uppdatera Gantt-diagrammet
        gantt.getTask(taskId).start_date = startDate;
        gantt.getTask(taskId).end_date = endDate;
        gantt.updateTask(taskId);

        // Stäng modalen
        document.querySelector('.modal').remove();
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
