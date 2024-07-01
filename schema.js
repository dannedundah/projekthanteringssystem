import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const employeeSelect = document.getElementById('employee-select');
    const gantChart = document.getElementById('gant-chart');

    employeeSelect.addEventListener('change', () => {
        const selectedEmployee = employeeSelect.value;
        if (selectedEmployee) {
            showGanttChart(selectedEmployee);
        } else {
            gantChart.innerHTML = '';
        }
    });

    async function showGanttChart(employeeName) {
        try {
            const querySnapshot = await getDocs(collection(db, "schedules"));
            const schedules = querySnapshot.docs.map(doc => doc.data());
            const employeeSchedules = schedules.filter(schedule => schedule.name === employeeName);

            gantChart.innerHTML = '';
            if (employeeSchedules.length > 0) {
                employeeSchedules.forEach(schedule => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <p><strong>Projekt:</strong> ${schedule.projectId}</p>
                        <p><strong>Startdatum:</strong> ${schedule.startDate}</p>
                        <p><strong>Slutdatum:</strong> ${schedule.endDate}</p>
                    `;
                    gantChart.appendChild(div);
                });
            } else {
                gantChart.textContent = 'Inga scheman hittades för denna anställd.';
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    }

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
