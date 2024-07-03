import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const scheduleList = document.getElementById('schedule-list');

    viewScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = document.getElementById('employee-select').value.trim();

        if (!employeeName) {
            alert('Vänligen välj ett namn.');
            return;
        }

        try {
            const querySnapshot = await getDocs(collection(db, 'planning'));
            const plannings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const employeeSchedules = plannings.filter(planning => planning.employees.includes(employeeName));

            scheduleList.innerHTML = '';
            if (employeeSchedules.length > 0) {
                employeeSchedules.forEach(schedule => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <p><strong>Projekt:</strong> ${schedule.projectId}</p>
                        <p><strong>Startdatum:</strong> ${schedule.startDate}</p>
                        <p><strong>Slutdatum:</strong> ${schedule.endDate}</p>
                    `;
                    scheduleList.appendChild(div);
                });
            } else {
                scheduleList.textContent = 'Inga scheman hittades för denna anställd.';
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    });
});

function navigateTo(page) {
    window.location.href = page;
}
