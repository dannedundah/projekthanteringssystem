import { 
    auth, 
    db, 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, // Se till att deleteDoc importeras korrekt
    doc, 
    onAuthStateChanged 
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const serviceTeamSelect = document.getElementById('service-team');
    const addPlanBtn = document.getElementById('add-plan-btn');
    const serviceComment = document.getElementById('service-comment');
    const serviceDate = document.getElementById('service-date');
    const servicePlanTableBody = document.getElementById('service-plan-table').querySelector('tbody');

    let canEdit = false;
    let serviceTeam = [];
    let plans = [];

    // Kontrollera om användaren är inloggad och tillåten att redigera
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userEmail = user.email;
            canEdit = ["daniel@delidel.se", "sofie@delidel.se"].includes(userEmail);
            if (canEdit) {
                initializePage();
            } else {
                alert("Du har inte behörighet att se denna sida.");
                window.location.href = 'index.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // Initialisera sidan genom att ladda medlemmar och planeringar
    async function initializePage() {
        await loadServiceTeam();
        await loadServicePlans();

        addPlanBtn.addEventListener('click', addPlan);
    }

    // Ladda service-teammedlemmar från Firebase
    async function loadServiceTeam() {
        const teamSnapshot = await getDocs(collection(db, 'teams'));
        serviceTeam = teamSnapshot.docs.map(doc => doc.data()).filter(team => team.name === 'Service');

        serviceTeam.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            serviceTeamSelect.appendChild(option);
        });
    }

    // Ladda alla planeringar för servicegänget
    async function loadServicePlans() {
        const plansSnapshot = await getDocs(collection(db, 'service-plans'));
        plans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderPlans();
    }

    // Rendera alla planeringar i tabellen
    function renderPlans() {
        servicePlanTableBody.innerHTML = '';
        plans.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.member}</td>
                <td>${plan.date}</td>
                <td>${plan.comment}</td>
                <td><button class="delete-plan-btn" data-id="${plan.id}">Ta bort</button></td>
            `;
            servicePlanTableBody.appendChild(row);
        });

        // Lägg till lyssnare på alla "Ta bort"-knappar
        document.querySelectorAll('.delete-plan-btn').forEach(button => {
            button.addEventListener('click', deletePlan);
        });
    }

    // Lägg till en ny planering
    async function addPlan() {
        const member = serviceTeamSelect.value;
        const comment = serviceComment.value;
        const date = serviceDate.value;

        if (!member || !comment || !date) {
            alert("Vänligen fyll i alla fält.");
            return;
        }

        const newPlan = {
            member,
            comment,
            date
        };

        try {
            await addDoc(collection(db, 'service-plans'), newPlan);
            alert("Planering tillagd!");
            serviceComment.value = '';
            serviceDate.value = '';
            await loadServicePlans();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }

    // Ta bort en planering
    async function deletePlan(event) {
        const planId = event.target.getAttribute('data-id');
        const planRef = doc(db, 'service-plans', planId);  // Hämta rätt referens

        try {
            await deleteDoc(planRef);  // Använd deleteDoc för att ta bort dokumentet
            alert("Planering borttagen.");
            await loadServicePlans();  // Uppdatera listan efter borttagning
        } catch (error) {
            console.error("Error removing document: ", error);  // Logga eventuella fel
        }
    }
});
