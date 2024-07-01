import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const ganttChartContainer = document.getElementById('gantt-chart-container');

    if (viewScheduleForm) {
        viewScheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const employeeName = document.getElementById('employee-name').value.trim();

            if (employeeName !== '') {
                try {
                    const querySnapshot = await getDocs(collection(db, "planning"));
                    const schedules = querySnapshot.docs.map(doc => doc.data());
                    const employeeSchedules = schedules.filter(schedule => schedule.employees.includes(employeeName));

                    ganttChartContainer.innerHTML = '';
                    if (employeeSchedules.length > 0) {
                        drawGanttChart(employeeSchedules);
                    } else {
                        ganttChartContainer.textContent = 'Inga scheman hittades för denna anställd.';
                    }
                } catch (error) {
                    console.error('Error fetching schedules:', error);
                }
            }
        });
    }

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});

function drawGanttChart(schedules) {
    const container = document.getElementById('gantt-chart-container');
    container.innerHTML = '<h2>Gantt Schema</h2>';

    const chart = document.createElement('div');
    chart.className = 'gantt-chart';

    schedules.forEach(schedule => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'gantt-bar';
        projectDiv.style.left = `${calculateDaysOffset(schedule.startDate)}px`;
        projectDiv.style.width = `${calculateDuration(schedule.startDate, schedule.endDate)}px`;
        projectDiv.innerHTML = `
            <div><strong>Projekt:</strong> ${schedule.projectId}</div>
            <div><strong>Adress:</strong> ${schedule.address}</div>
            <div><strong>Startdatum:</strong> ${schedule.startDate}</div>
            <div><strong>Slutdatum:</strong> ${schedule.endDate}</div>
        `;
        chart.appendChild(projectDiv);
    });

    container.appendChild(chart);
}

function calculateDaysOffset(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    const timeDiff = start - today;
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) * 10; // 10px per day
}

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end - start;
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) * 10; // 10px per day
}
