import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const ganttChart = document.getElementById('gantt-chart');
    const employeeDropdown = document.getElementById('employee-name');

    viewScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = employeeDropdown.value.trim();

        if (employeeName !== '') {
            try {
                const querySnapshot = await getDocs(collection(db, "schedules"));
                const schedules = querySnapshot.docs.map(doc => doc.data());
                const employeeSchedules = schedules.filter(schedule => schedule.name === employeeName);

                ganttChart.innerHTML = '';
                if (employeeSchedules.length > 0) {
                    // Sort schedules by start date in ascending order
                    employeeSchedules.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                    renderGanttChart(employeeSchedules);
                } else {
                    ganttChart.textContent = 'Inga scheman hittades för denna anställd.';
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
        } else {
            try {
                const querySnapshot = await getDocs(collection(db, "schedules"));
                const schedules = querySnapshot.docs.map(doc => doc.data());

                ganttChart.innerHTML = '';
                if (schedules.length > 0) {
                    // Sort schedules by start date in ascending order
                    schedules.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                    renderGanttChart(schedules);
                } else {
                    ganttChart.textContent = 'Inga scheman hittades.';
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
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
