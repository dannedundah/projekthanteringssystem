import { auth, db, collection, getDocs, addDoc, doc, updateDoc, onAuthStateChanged, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const employeeSelect = document.getElementById('employee-select');
    const servicePlanningForm = document.getElementById('service-planning-form');
    const ganttChartContainer = document.getElementById('gantt-chart');
    const backBtn = document.getElementById('back-btn');

    let serviceTeam = [];

    // Kontrollera att användaren är inloggad och har rätt roll
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists() && (userDoc.data().role === 'Admin' || userDoc.data().role === 'Service')) {
                    loadServiceTeam();  // Ladda service-teamet
                    loadServicePlans(); // Ladda tidigare planeringar
                } else {
                    alert("Du har inte behörighet att se denna sida.");
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error("Error loading user data:", error);
                alert("Ett fel uppstod vid hämtning av användardata.");
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // Ladda teamet "Team Service" och fyll i rullgardinsmenyn med medlemmar
    async function loadServiceTeam() {
        try {
            const teamsSnapshot = await getDocs(collection(db, 'teams'));
            const serviceTeamData = teamsSnapshot.docs.map(doc => doc.data()).find(team => team.name === 'Team Service');
            serviceTeam = serviceTeamData ? serviceTeamData.members : [];

            // Fyll i rullgardinsmenyn
            serviceTeam.forEach(member => {
                const option = document.createElement('option');
                option.value = member;
                option.textContent = member;
                employeeSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading service team:", error);
            alert("Ett fel uppstod vid hämtning av service-teamet.");
        }
    }

    // Ladda och rendera Gantt-schemat för service-planer
    async function loadServicePlans() {
        try {
            const plansSnapshot = await getDocs(collection(db, 'service-plans'));
            const plans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            renderGanttChart(plans);
        } catch (error) {
            console.error("Error loading service plans:", error);
            alert("Ett fel uppstod vid hämtning av service-planer.");
        }
    }

    // Rendera Gantt-schemat med DHTMLX Gantt, och visa adressen och ansvarig person
    function renderGanttChart(plans) {
        gantt.config.xml_date = "%Y-%m-%d";
        gantt.config.drag_move = true; // Tillåt att flytta projekt
        gantt.config.drag_resize = true; // Tillåt att ändra storlek på projekt
        gantt.init("gantt-chart");

        // Anpassa kolumnerna till vänster i Gantt-schemat
        gantt.config.columns = [
            { name: "text", label: "Adress", width: 200, tree: true },
            { name: "employee", label: "Ansvarig", align: "center", width: 100 }
        ];

        const tasks = plans.map(plan => ({
            id: plan.id,
            text: plan.address,  // Adressen visas som projektets namn
            employee: plan.employee,  // Ansvarig person
            start_date: plan.date,
            duration: 1,  // Varaktighet för en dag
            details: plan.task
        }));

        gantt.clearAll();
        gantt.parse({ data: tasks });

        // Spara datumändringar när ett projekt flyttas eller ändras
        gantt.attachEvent("onAfterTaskUpdate", async function(id, item) {
            await saveTaskDates(id, item);
        });

        // Visa popup med detaljer när man klickar på ett projekt
        gantt.attachEvent("onTaskClick", function (id) {
            const task = gantt.getTask(id);
            showPopup(`Adress: ${task.text}<br>Uppgift: ${task.details}<br>Ansvarig: ${task.employee}`);
            return true;
        });
    }

    // Spara de nya datumen efter att ett projekt flyttas eller ändras
    async function saveTaskDates(taskId, task) {
        const planningRef = doc(db, 'service-plans', taskId);
        const startDate = task.start_date.toISOString().split('T')[0]; // Konvertera startdatumet till rätt format

        try {
            await updateDoc(planningRef, {
                date: startDate // Uppdatera datumet
            });
            console.log("Datum uppdaterat för uppgift:", taskId);
        } catch (error) {
            console.error("Error updating task date:", error);
            alert("Ett fel uppstod vid uppdateringen av datumet.");
        }
    }

    // Skapa popup med uppgift och adress
    function showPopup(taskDetails) {
        // Skapa popup-elementet
        const popup = document.createElement('div');
        popup.classList.add('popup');

        // Lägg till innehållet och stängningsknappen
        popup.innerHTML = `
            <div class="popup-content">
                <span class="close-btn">&times;</span>
                <h2>Detaljer för uppgiften</h2>
                <p>${taskDetails}</p>
            </div>
        `;

        // Lägg till popupen i dokumentet
        document.body.appendChild(popup);

        // Hantera stängning när användaren klickar på stängningsknappen
        const closeButton = popup.querySelector('.close-btn');
        closeButton.addEventListener('click', () => {
            popup.remove();
        });

        // Alternativt: Hantera stängning om användaren klickar utanför popupen
        window.addEventListener('click', (event) => {
            if (event.target === popup) {
                popup.remove();
            }
        });
    }

    // Hantera formulärinlämning för att skapa en ny service-plan
    servicePlanningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const employee = employeeSelect.value;
        const address = document.getElementById('address').value;
        const task = document.getElementById('task').value;
        const date = document.getElementById('date').value;

        if (!employee || !address || !task || !date) {
            alert("Vänligen fyll i alla fält.");
            return;
        }

        try {
            await addDoc(collection(db, 'service-plans'), {
                employee,
                address,
                task,
                date
            });

            loadServicePlans();
            servicePlanningForm.reset();  // Återställ formuläret efter inlämning
        } catch (error) {
            console.error("Error adding service plan:", error);
            alert("Ett fel uppstod vid skapandet av service-planen.");
        }
    });

    // Navigera tillbaka till startsidan
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
