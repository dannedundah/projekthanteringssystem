import { auth, db, collection, getDocs, addDoc, doc, onAuthStateChanged, getDoc, updateDoc, deleteDoc } from './firebase-config.js';

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

    // Ladda teamet "Team Service" och fyll i rullgardinsmenyn med medlemmar
    async function loadServiceTeam() {
        try {
            const teamsSnapshot = await getDocs(collection(db, 'teams'));
            const serviceTeamData = teamsSnapshot.docs.map(doc => doc.data()).find(team => team.name === 'Team Service');
            serviceTeam = serviceTeamData ? serviceTeamData.members : [];

            if (serviceTeam.length === 0) {
                console.warn('Inga medlemmar hittades i "Team Service".');
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

    // Rendera service-planer i tabellen med ta bort-knapp och kryssruta för färdigställande
    function renderPlans(plans) {
        servicePlanTableBody.innerHTML = '';
        if (plans.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4">Inga planeringar tillgängliga.</td>`;
            servicePlanTableBody.appendChild(row);
        } else {
            plans.forEach(plan => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${plan.employee}</td>
                    <td>${plan.task}</td>
                    <td>${plan.date}</td>
                    <td><input type="checkbox" class="mark-complete" data-id="${plan.id}" ${plan.completed ? 'checked' : ''}></td>
                    <td><button class="delete-plan-btn" data-id="${plan.id}">Ta bort</button></td>
                `;
                servicePlanTableBody.appendChild(row);
            });

            // Lägg till event listeners för att hantera ta bort och färdigställande
            document.querySelectorAll('.delete-plan-btn').forEach(button => {
                button.addEventListener('click', deletePlan);
            });

            document.querySelectorAll('.mark-complete').forEach(checkbox => {
                checkbox.addEventListener('change', markComplete);
            });
        }
    }

    // Funktion för att ta bort en service-plan
    async function deletePlan(event) {
        const planId = event.target.getAttribute('data-id');
        try {
            await deleteDoc(doc(db, 'service-plans', planId));
            await loadServicePlans();  // Ladda om planerna efter borttagning
        } catch (error) {
            console.error("Error removing service plan:", error);
            alert("Ett fel uppstod vid borttagning av service-planen.");
        }
    }

    // Funktion för att markera en service-plan som färdig
    async function markComplete(event) {
        const planId = event.target.getAttribute('data-id');
        const isCompleted = event.target.checked;

        try {
            const planRef = doc(db, 'service-plans', planId);
            await updateDoc(planRef, { completed: isCompleted });
            alert("Planens status har uppdaterats.");
        } catch (error) {
            console.error("Error updating plan status:", error);
            alert("Ett fel uppstod vid uppdatering av planens status.");
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
                date,
                completed: false  // Ny plan är inte färdig vid skapandet
            });

            await loadServicePlans();
            servicePlanningForm.reset();  // Återställ formuläret efter inlämning
        } catch (error) {
            console.error("Error adding service plan:", error);
            alert("Ett fel uppstod vid skapandet av service-planen.");
        }
    });
});
