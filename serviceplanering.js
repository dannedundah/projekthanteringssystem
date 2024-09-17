import { auth, db, collection, getDocs, addDoc, doc, updateDoc, onAuthStateChanged, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ganttChartContainer = document.getElementById('gantt-chart');
    const employeeSelect = document.getElementById('employee-select');
    const servicePlanningForm = document.getElementById('service-planning-form');
    let plannings = [];
    let serviceTeam = [];
    let canEdit = false;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && (userDoc.data().role === 'Admin' || userDoc.data().role === 'Service')) {
                canEdit = true;
                await initializePage();
            } else {
                alert("Du har inte behörighet att se denna sida.");
                window.location.href = 'login.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    async function initializePage() {
        try {
            const querySnapshot = await getDocs(collection(db, 'service-plans'));
            plannings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const teamsSnapshot = await getDocs(collection(db, 'teams'));
            serviceTeam = teamsSnapshot.docs.map(doc => doc.data()).find(team => team.name === 'Team Service').members;

            populateEmployeeSelect();
            renderGanttChart();
        } catch (error) {
            console.error('Error fetching plannings or teams:', error);
        }
    }

    function populateEmployeeSelect() {
        employeeSelect.innerHTML = '<option value="">Välj person</option>';
        serviceTeam.forEach(member => {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            employeeSelect.appendChild(option);
        });
    }

    async function renderGanttChart(filteredPlannings = plannings) {
        ganttChartContainer.innerHTML = '';

        gantt.config.xml_date = "%Y-%m-%d";
        gantt.config.readonly = !canEdit;

        gantt.templates.scale_cell_class = function(date) {
            if (date.getDay() === 0 || date.getDay() === 6) {
                return "weekend";
            }
        };

        gantt.templates.timeline_cell_class = function(item, date) {
            if (date.getDay() === 0 || date.getDay() === 6) {
                return "weekend";
            }
        };

        gantt.config.columns = [
            { name: "checkbox", label: "", width: 30, template: checkboxTemplate },
            { name: "text", label: "Adress", width: 200, tree: true },
            { name: "person", label: "Person", align: "center", width: 150 },
            { name: "start_date", label: "Startdatum", align: "center", width: 100 },
            { name: "duration", label: "Varaktighet", align: "center", width: 80 }
        ];

        const tasks = filteredPlannings.map(planning => {
            const startDate = planning.date;
            return {
                id: planning.id,
                text: planning.address,
                person: planning.employee,
                start_date: startDate,
                duration: 1, // Assuming each task is one day, adjust as needed
                taskData: planning.task,
                completed: planning.completed || false // Lägg till flaggan completed
            };
        });

        gantt.init("gantt-chart");

        gantt.parse({
            data: tasks,
            links: []
        });

        gantt.attachEvent("onAfterTaskUpdate", async function(id, item) {
            await saveTaskDates(id);
            showConfirmationPopup("Datum uppdaterat och sparat!");
        });

        gantt.attachEvent("onTaskClick", function(id) {
            const task = gantt.getTask(id);
            showPopup(`Adress: ${task.text}<br>Uppgift: ${task.taskData}<br>Ansvarig: ${task.person}`);
            return true;
        });
    }

    // Funktion för att spara de uppdaterade datumen i Firestore
    async function saveTaskDates(taskId) {
        const task = gantt.getTask(taskId);
        const startDate = new Date(Date.UTC(task.start_date.getFullYear(), task.start_date.getMonth(), task.start_date.getDate()));

        const formattedStartDate = startDate.toISOString().split('T')[0];

        const planningRef = doc(db, 'service-plans', taskId);

        try {
            await updateDoc(planningRef, {
                date: formattedStartDate
            });
            console.log(`Date saved successfully for task: ${taskId}`);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }

    // Form submit handler for adding new service plans
    servicePlanningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const employee = employeeSelect.value;
        const address = document.getElementById('address').value;
        const task = document.getElementById('task').value;
        const date = document.getElementById('date').value;

        if (!employee || !task || !date || !address) {
            alert("Vänligen fyll i alla fält.");
            return;
        }

        try {
            await addDoc(collection(db, 'service-plans'), {
                employee,
                address,
                task,
                date,
                completed: false // Lägg till en flagga för att markera om projektet är klart eller inte
            });

            alert("Planering tillagd!");
            await initializePage();  // Refresh the page after submission
            servicePlanningForm.reset();  // Clear form inputs
        } catch (error) {
            console.error("Error adding service plan:", error);
            alert("Ett fel uppstod vid skapandet av service-planen.");
        }
    });

    // Funktion för att spara om projektet är klart eller inte i Firestore
    async function saveCompletedStatus(taskId, isCompleted) {
        const planningRef = doc(db, 'service-plans', taskId);
        try {
            await updateDoc(planningRef, {
                completed: isCompleted
            });
            console.log(`Projektstatus uppdaterad: ${taskId}`);
        } catch (error) {
            console.error("Error updating completed status:", error);
        }
    }

    // Template för checkbox som används för att markera projekt som klart
    function checkboxTemplate(task) {
        const checked = task.completed ? 'checked' : '';
        return `<input type="checkbox" class="project-completed" ${checked} data-id="${task.id}">`;
    }

    // Lyssnare för att hantera klick på checkbox för att markera projekt som klart
    gantt.attachEvent("onCheckboxClick", function(taskId, e) {
        const task = gantt.getTask(taskId);
        const isChecked = e.target.checked;
        task.completed = isChecked;
        saveCompletedStatus(taskId, isChecked);
    });

    // Lägg till en sökfunktion för att filtrera på personer
    document.getElementById('employee-search').addEventListener('input', (e) => {
        const searchValue = e.target.value.toLowerCase();
        const filteredPlannings = plannings.filter(planning => 
            planning.employee.toLowerCase().includes(searchValue)
        );
        renderGanttChart(filteredPlannings);
    });

    // Funktion för att visa popup för projektinformation
    function showPopup(message) {
        const popup = document.createElement('div');
        popup.classList.add('task-details-popup');
        popup.innerHTML = `<p>${message}</p><button id="close-popup">Stäng</button>`;
        document.body.appendChild(popup);

        document.getElementById('close-popup').addEventListener('click', () => {
            document.body.removeChild(popup);
        });
    }

    // Funktion för att visa popup för bekräftelse
    function showConfirmationPopup(message) {
        const popup = document.createElement('div');
        popup.classList.add('confirmation-popup');
        popup.textContent = message;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('show');
        }, 100);

        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }, 3000);
    }

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
