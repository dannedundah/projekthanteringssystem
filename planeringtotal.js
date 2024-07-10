import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const planningTotalContainer = document.getElementById('planning-total-container');

    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        const plannings = querySnapshot.docs.map(doc => doc.data());

        planningTotalContainer.innerHTML = '';
        if (plannings.length > 0) {
            renderPlanningTotal(plannings);
        } else {
            planningTotalContainer.textContent = 'Inga planeringar hittades.';
        }
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }

    function renderPlanningTotal(plannings) {
        const table = document.createElement('table');
        table.classList.add('gantt-table');

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Adress</th>
            <th>Startdatum</th>
            <th>Slutdatum</th>
        `;
        table.appendChild(headerRow);

        plannings.forEach(planning => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${planning.projectAddress || 'Ej specificerad'}</td>
                <td>${planning.startDate}</td>
                <td>${planning.endDate}</td>
            `;
            table.appendChild(row);
        });

        planningTotalContainer.appendChild(table);
    }
});
