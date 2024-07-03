import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const scheduleList = document.getElementById('schedule-list');

    // Render all schedules on page load
    await renderAllSchedules();

    viewScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = document.getElementById('employee-name').value;

        if (employeeName) {
            await renderEmployeeSchedule(employeeName);
        } else {
            await renderAllSchedules();
        }
    });

    async function renderAllSchedules() {
        scheduleList.innerHTML = '';
        try {
            const querySnapshot = await getDocs(collection(db, "schedules"));
            const schedules = querySnapshot.docs.map(doc => doc.data());
            if (schedules.length > 0) {
                schedules.forEach(schedule => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <p><strong>Anställd:</strong> ${schedule.name}</p>
                        <p><strong>Projektadress:</strong> ${schedule.projectAddress}</p>
                        <p><strong>Startdatum:</strong> ${schedule.startDate}</p>
                        <p><strong>Slutdatum:</strong> ${schedule.endDate}</p>
                        <hr>
                    `;
                    scheduleList.appendChild(div);
                });
            } else {
                scheduleList.textContent = 'Inga scheman hittades.';
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    }

    async function renderEmployeeSchedule(employeeName) {
        scheduleList.innerHTML = '';
        try {
            const querySnapshot = await getDocs(collection(db, "schedules"));
            const schedules = querySnapshot.docs.map(doc => doc.data());
            const employeeSchedules = schedules.filter(schedule => schedule.name === employeeName);
            if (employeeSchedules.length > 0) {
                employeeSchedules.forEach(schedule => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <p><strong>Projektadress:</strong> ${schedule.projectAddress}</p>
                        <p><strong>Startdatum:</strong> ${schedule.startDate}</p>
                        <p><strong>Slutdatum:</strong> ${schedule.endDate}</p>
                        <hr>
                    `;
                    scheduleList.appendChild(div);
                });
            } else {
                scheduleList.textContent = 'Inga scheman hittades för denna anställd.';
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    }
});
