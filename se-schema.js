import { db, collection, getDocs, doc, getDoc } from './firebase-config.js';

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

            // Sort schedules by start date in ascending order
            schedules = schedules.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            ganttChart.innerHTML = '';
            if (employeeName !== '') {
                const employeeSchedules = schedules.filter(schedule => schedule.employees.includes(employeeName));
                if (employeeSchedules.length > 0) {
                    await renderGanttChart(employeeSchedules);
                } else {
                    ganttChart.textContent = 'Inga scheman hittades för denna anställd.';
                }
            } else {
                if (schedules.length > 0) {
                    await renderGanttChart(schedules);
                } else {
                    ganttChart.textContent = 'Inga scheman hittades.';
                }
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    });

    async function renderGanttChart(schedules) {
        const table = document.createElement('table');
        table.classList.add('gantt-table');

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Projekt</th>
            <th>Startdatum</th>
            <th>Slutdatum</th>
        `;
        table.appendChild(headerRow);

        for (const schedule of schedules) {
            const projectDoc = await getDoc(doc(db, "projects", schedule.project));
            const projectData = projectDoc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="projekt-detalj.html?id=${schedule.project}">${projectData.address}</a></td>
                <td>${schedule.startDate}</td>
                <td>${schedule.endDate}</td>
            `;
            table.appendChild(row);
        }

        ganttChart.appendChild(table);
    }

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
