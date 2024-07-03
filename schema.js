import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const scheduleList = document.getElementById('schedule-list');

    try {
        const querySnapshot = await getDocs(collection(db, "schedules"));
        const schedules = querySnapshot.docs.map(doc => doc.data());

        // Visa alla scheman som ett gant schema
        showAllSchedules(schedules);

        viewScheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const employeeName = document.getElementById('employee-name').value.trim();
            if (employeeName !== '') {
                showSchedule(employeeName, schedules);
            }
        });
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
});

function showAllSchedules(schedules) {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';
    schedules.forEach(schedule => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p><strong>Anställd:</strong> ${schedule.name}</p>
            <p><strong>Kundadress:</strong> ${schedule.projectAddress}</p>
            <p><strong>Startdatum:</strong> ${schedule.startDate}</p>
            <p><strong>Slutdatum:</strong> ${schedule.endDate}</p>
        `;
        scheduleList.appendChild(div);
    });
}

function showSchedule(name, schedules) {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';
    const filteredSchedules = schedules.filter(schedule => schedule.name === name);
    if (filteredSchedules.length > 0) {
        filteredSchedules.forEach(schedule => {
            const div = document.createElement('div');
            div.innerHTML = `
                <p><strong>Anställd:</strong> ${schedule.name}</p>
                <p><strong>Kundadress:</strong> ${schedule.projectAddress}</p>
                <p><strong>Startdatum:</strong> ${schedule.startDate}</p>
                <p><strong>Slutdatum:</strong> ${schedule.endDate}</p>
            `;
            scheduleList.appendChild(div);
        });
    } else {
        scheduleList.textContent = 'Inga scheman hittades för denna anställd.';
    }
}
