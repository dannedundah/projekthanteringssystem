import { auth, db, collection, getDocs, addDoc, doc, onAuthStateChanged, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const employeeSelect = document.getElementById('employee-select');
    const servicePlanTableBody = document.getElementById('service-plan-table').querySelector('tbody');
    const servicePlanningForm = document.getElementById('service-planning-form');

    let serviceTeam = [];

    // Kontrollera att användaren är inloggad och har rätt roll
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists() && (userDoc.data().role === 'Admin' || userDoc.data().role === 'Service')) {
                    await loadServiceTeam();  // Ladda service-teamet
                    await loadServicePlans(); // Ladda tidigare planeringar
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

    // Ladda teamet "Service" och fyll i rullgardinsmenyn med medlemmar
    async function loadServiceTeam() {
        try {
            const teamsSnapshot = await getDocs(collection(db, 'teams'));
            const serviceTeamData = teamsSnapshot.docs.map(doc => doc.data()).find(team => team.name === 'Service');
            serviceTeam = serviceTeamData ? serviceTeamData.members : [];

            if (serviceTeam.length === 0) {
                console.warn('Inga medlemmar hittades i "Service"-teamet.');
            }

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
            const plans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            renderPlans(plans);
        } catch (error) {
            console.error("Error loading service plans:", error);
            alert("Ett fel uppstod vid hämtning av service-planer.");
        }
    }

    // Rendera service-planer i tabellen
    function renderPlans(plans) {
        servicePlanTableBody.innerHTML = '';
        if (plans.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="3">Inga planeringar tillgängliga.</td>`;
            servicePlanTableBody.appendChild(row);
        } else {
            plans.forEach(plan => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${plan.employee}</td>
                    <td>${plan.task}</td>
                    <td>${plan.date}</td>
                `;
                servicePlanTableBody.appendChild(row);
            });
        }
    }

    // Hantera formulärinlämning för att skapa en ny service-plan
    servicePlanningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const employee = employeeSelect.value;
        const task = document.getElementById('task').value;
        const date = document.getElementById('date').value;

        if (!employee || !task || !date) {
            alert("Vänligen fyll i alla fält.");
            return;
        }

        try {
            await addDoc(collection(db, 'service-plans'), {
                employee,
                task,
                date
            });

            await loadServicePlans();
            servicePlanningForm.reset();  // Återställ formuläret efter inlämning
        } catch (error) {
            console.error("Error adding service plan:", error);
            alert("Ett fel uppstod vid skapandet av service-planen.");
        }
    });
});
