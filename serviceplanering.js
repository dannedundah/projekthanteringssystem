import { db, collection, getDocs, addDoc, doc, deleteDoc, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const employeeSelect = document.getElementById('employee-select');
    const servicePlanTableBody = document.getElementById('service-plan-table').querySelector('tbody');
    const servicePlanningForm = document.getElementById('service-planning-form');

    let serviceTeam = [];

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists() && userDoc.data().role === 'Admin' || userDoc.data().role === 'Service') {
                loadServiceTeam();
                loadServicePlans();
            } else {
                alert("Du har inte behörighet att se denna sida.");
                window.location.href = 'login.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    async function loadServiceTeam() {
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        serviceTeam = teamsSnapshot.docs.map(doc => doc.data()).find(team => team.name === 'Service').members;

        serviceTeam.forEach(member => {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            employeeSelect.appendChild(option);
        });
    }

    async function loadServicePlans() {
        const plansSnapshot = await getDocs(collection(db, 'service-plans'));
        const plans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        renderPlans(plans);
    }

    function renderPlans(plans) {
        servicePlanTableBody.innerHTML = '';
        plans.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.employee}</td>
                <td>${plan.task}</td>
                <td>${plan.date}</td>
                <td><button class="delete-plan-btn" data-id="${plan.id}">Ta bort</button></td>
            `;
            servicePlanTableBody.appendChild(row);
        });

        document.querySelectorAll('.delete-plan-btn').forEach(button => {
            button.addEventListener('click', deletePlan);
        });
    }

    async function deletePlan(event) {
        const planId = event.target.getAttribute('data-id');
        await deleteDoc(doc(db, 'service-plans', planId));
        loadServicePlans();
    }

    servicePlanningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const employee = employeeSelect.value;
        const task = document.getElementById('task').value;
        const date = document.getElementById('date').value;

        await addDoc(collection(db, 'service-plans'), {
            employee,
            task,
            date
        });

        loadServicePlans();
        servicePlanningForm.reset();
    });
});
