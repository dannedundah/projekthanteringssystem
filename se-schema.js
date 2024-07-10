import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const ganttChart = document.getElementById('gantt-chart');
    const employeeDropdown = document.getElementById('employee-name');

    viewScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = employeeDropdown.value.trim();

        try {
            const querySnapshot = await getDocs(collection(db, "schedules"));
            const schedules = querySnapshot.docs.map(doc => doc.data());
            const employeeSchedules = employeeName ? schedules.filter(schedule => schedule.employees.includes(employeeName)) : schedules;

            ganttChart.innerHTML = '';
            if (employeeSchedules.length > 0) {
                renderGanttChart(employeeSchedules);
            } else {
                ganttChart.textContent = 'Inga scheman hittades.';
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    });

    function renderGanttChart(schedules) {
        const table = document.createElement('table');
        table.classList.add('gantt-table');

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Projekt</th>
            <th>Startdatum</th>
            <th>Slutdatum</th>
        `;
        table.appendChild(headerRow);

        schedules.forEach(schedule => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${schedule.projectAddress}</td>
                <td>${schedule.startDate}</td>
                <td>${schedule.endDate}</td>
            `;
            table.appendChild(row);
        });

        ganttChart.appendChild(table);
    }

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
