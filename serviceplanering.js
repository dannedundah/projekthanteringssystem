import { auth, db, collection, getDocs, addDoc, doc, onAuthStateChanged, getDoc } from './firebase-config.js';

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
        gantt.init("gantt-chart");

        const tasks = plans.map(plan => ({
            id: plan.id,
            text: `${plan.address} - ${plan.employee}`,  // Visa både adress och ansvarig person
            start_date: plan.date,
            duration: 1,  // Varaktighet för en dag
            details: plan.task
        }));

        gantt.clearAll();
        gantt.parse({ data: tasks });

        // Visa popup med detaljer när man klickar på ett projekt
        gantt.attachEvent("onTaskClick", function (id) {
            const task = gantt.getTask(id);
            showPopup(`Adress: ${task.text.split(' - ')[0]}<br>Uppgift: ${task.details}<br>Ansvarig: ${task.text.split(' - ')[1]}`);
            return true;
        });
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
