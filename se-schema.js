import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const ganttChart = document.getElementById('gantt-chart');
    const employeeDropdown = document.getElementById('employee-name');

    viewScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = employeeDropdown.value.trim();

        try {
            const querySnapshot = await getDocs(collection(db, "planning"));
            let schedules = querySnapshot.docs.map(doc => doc.data());

            // Sort schedules by start date in descending order
            schedules = schedules.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

            ganttChart.innerHTML = '';
            if (employeeName !== '') {
                const employeeSchedules = schedules.filter(schedule => schedule.employees.includes(employeeName));
                if (employeeSchedules.length > 0) {
                    renderGanttChart(employeeSchedules);
                } else {
                    ganttChart.textContent = 'Inga scheman hittades för denna anställd.';
                }
            } else {
                if (schedules.length > 0) {
                    renderGanttChart(schedules);
                } else {
                    ganttChart.textContent = 'Inga scheman hittades.';
                }
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
                <td><a href="projekt-detalj.html?id=${schedule.project}">${schedule.projectAddress}</a></td>
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
