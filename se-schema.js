import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const ganttChart = document.getElementById('gantt-chart');
    const employeeDropdown = document.getElementById('employee-name');

    // Render initial Gantt chart with all schedules
    fetchAndRenderSchedules();

    viewScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = employeeDropdown.value.trim();
        fetchAndRenderSchedules(employeeName);
    });

    async function fetchAndRenderSchedules(employeeName = '') {
        try {
            const querySnapshot = await getDocs(collection(db, "schedules"));
            const schedules = querySnapshot.docs.map(doc => doc.data());
            const filteredSchedules = employeeName ? schedules.filter(schedule => schedule.name === employeeName) : schedules;
            renderGanttChart(filteredSchedules);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    }

    function renderGanttChart(schedules) {
        ganttChart.innerHTML = '';

        if (schedules.length === 0) {
            ganttChart.textContent = 'Inga scheman hittades.';
            return;
        }

        const table = document.createElement('table');
        table.className = 'gantt-table';

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Anställd</th>
            <th>Projekt</th>
            <th>Startdatum</th>
            <th>Slutdatum</th>
        `;
        table.appendChild(headerRow);

        schedules.forEach(schedule => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${schedule.name}</td>
                <td>${schedule.project}</td>
                <td>${schedule.startDate}</td>
                <td>${schedule.endDate}</td>
            `;
            table.appendChild(row);
        });

        ganttChart.appendChild(table);
    }
});
