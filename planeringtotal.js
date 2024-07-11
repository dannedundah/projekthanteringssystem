import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ganttChart = document.getElementById('gantt-chart');

    try {
        const querySnapshot = await getDocs(collection(db, "planning"));
        const plannings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        renderGanttChart(plannings);

        window.searchProjects = () => {
            const input = document.getElementById('search-input').value.toLowerCase();
            const filteredPlannings = plannings.filter(planning => 
                planning.project.toLowerCase().includes(input)
            );
            renderGanttChart(filteredPlannings);
        };
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }

    function renderGanttChart(plannings) {
        ganttChart.innerHTML = '';

        const table = document.createElement('table');
        table.classList.add('gantt-table');

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Projekt</th>
            <th>Startdatum</th>
            <th>Slutdatum</th>
            <th>Datum Elektriker</th>
        `;
        table.appendChild(headerRow);

        plannings.forEach(planning => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="projektdetalj.html?id=${planning.project}">${planning.project}</a></td>
                <td>${planning.startDate}</td>
                <td>${planning.endDate}</td>
                <td>${planning.electricianDate || 'Ej specificerad'}</td>
            `;
            table.appendChild(row);
        });

        ganttChart.appendChild(table);
    }

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
