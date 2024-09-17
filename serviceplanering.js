import { auth, db, collection, getDocs, addDoc, doc, onAuthStateChanged, getDoc, deleteDoc } from './firebase-config.js';

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

    // Ladda teamet "Service" och fyll i rullgardinsmenyn med medlemmar
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
        plans.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.employee}</td>
                <td>${plan.task}</td>
                <td>${plan.date}</td>
                <td><input type="checkbox" data-id="${plan.id}" ${plan.completed ? 'checked' : ''}></td>
                <td><button class="delete-plan-btn" data-id="${plan.id}">Ta bort</button></td>
            `;
            servicePlanTableBody.appendChild(row);
        });

        document.querySelectorAll('.delete-plan-btn').forEach(button => {
            button.addEventListener('click', deletePlan);
        });

        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', toggleCompleted);
        });
    }

    // Hantera borttagning av en service-plan
    async function deletePlan(event) {
        const planId = event.target.getAttribute('data-id');
        try {
            await deleteDoc(doc(db, 'service-plans', planId));
            loadServicePlans(); // Ladda om planerna efter borttagning
        } catch (error) {
            console.error("Error removing service plan:", error);
            alert("Ett fel uppstod vid borttagning av service-planen.");
        }
    }

    // Hantera uppdatering av en plan när den är markerad som färdig
    async function toggleCompleted(event) {
        const planId = event.target.getAttribute('data-id');
        const completed = event.target.checked;

        try {
            await updateDoc(doc(db, 'service-plans', planId), {
                completed: completed
            });
        } catch (error) {
            console.error("Error updating completion status:", error);
            alert("Ett fel uppstod vid uppdatering av slutförd status.");
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
                completed: false  // Nytt fält för att hålla reda på om uppgiften är klar
            });

            loadServicePlans();
            servicePlanningForm.reset();  // Återställ formuläret efter inlämning
        } catch (error) {
            console.error("Error adding service plan:", error);
            alert("Ett fel uppstod vid skapandet av service-planen.");
        }
    });
});
