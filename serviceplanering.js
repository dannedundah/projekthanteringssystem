import { auth, db, collection, getDocs, addDoc, doc, onAuthStateChanged, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const employeeSelect = document.getElementById('employee-select');
    const servicePlanningForm = document.getElementById('service-planning-form');

    let serviceTeam = [];
    let servicePlans = [];

    // Kontrollera att användaren är inloggad och har rätt roll
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists() && (userDoc.data().role === 'Admin' || userDoc.data().role === 'Service')) {
                    await loadServiceTeam();  // Ladda service-teamet
                    await loadServicePlans(); // Ladda tidigare planeringar
                    initializeGantt();        // Initiera Gantt-schemat
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

    // Ladda tidigare service-planer
    async function loadServicePlans() {
        try {
            const plansSnapshot = await getDocs(collection(db, 'service-plans'));
            servicePlans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error loading service plans:", error);
            alert("Ett fel uppstod vid hämtning av service-planer.");
        }
    }

    // Initiera Gantt-schemat och visa planerna
    function initializeGantt() {
        gantt.config.xml_date = "%Y-%m-%d";
        gantt.config.columns = [
            { name: "text", label: "Adress", width: "*", tree: true },
            { name: "employee", label: "Person", width: 100, align: "center" },
            { name: "start_date", label: "Datum", align: "center", width: 80 }
        ];

        gantt.init("gantt-chart");

        const tasks = servicePlans.map(plan => ({
            id: plan.id,
            text: plan.address, // Visa adressen i Gantt-schemat
            employee: plan.employee, // Visa vem som är planerad
            start_date: plan.date,
            duration: 1, // Exempel: Justera varaktigheten vid behov
            description: plan.task // Uppgift, som vi visar när man klickar på projektet
        }));

        gantt.clearAll();
        gantt.parse({ data: tasks });

        // Visa uppgifter när man klickar på en uppgift
        gantt.attachEvent("onTaskClick", function(id, e) {
            const task = gantt.getTask(id);
            showTaskDetails(task);
            return true;
        });
    }

    // Funktion för att visa en popup eller tooltip med adress och uppgift
    function showTaskDetails(task) {
        const popup = document.createElement('div');
        popup.classList.add('task-details-popup');
        popup.innerHTML = `
            <h3>Detaljer</h3>
            <p><strong>Adress:</strong> ${task.text}</p>
            <p><strong>Uppgift:</strong> ${task.description}</p>
            <button id="close-popup">Stäng</button>
        `;
        document.body.appendChild(popup);

        document.getElementById('close-popup').addEventListener('click', () => {
            document.body.removeChild(popup);
        });
    }

    // Hantera formulärinlämning för att skapa en ny service-plan
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
            const newPlan = { employee, address, task, date };
            await addDoc(collection(db, 'service-plans'), newPlan);
            servicePlans.push(newPlan);

            // Ladda om Gantt-schemat med den nya planen
            initializeGantt();
            servicePlanningForm.reset();  // Återställ formuläret efter inlämning
        } catch (error) {
            console.error("Error adding service plan:", error);
            alert("Ett fel uppstod vid skapandet av service-planen.");
        }
    });
});
