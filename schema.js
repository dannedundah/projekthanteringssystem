import { db, collection, getDocs, doc, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const scheduleList = document.getElementById('schedule-list');

    viewScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = document.getElementById('employee-name').value.trim();

        if (employeeName !== '') {
            try {
                const querySnapshot = await getDocs(collection(db, "planning"));
                const schedules = querySnapshot.docs.map(doc => doc.data());
                const employeeSchedules = schedules.filter(schedule => schedule.employees.includes(employeeName));

                scheduleList.innerHTML = '';
                if (employeeSchedules.length > 0) {
                    for (const schedule of employeeSchedules) {
                        const projectDoc = await getDoc(doc(db, 'projects', schedule.project));
                        const project = projectDoc.data();

                        const div = document.createElement('div');
                        div.innerHTML = `
                            <p><strong>Kundadress:</strong> ${project.address}</p>
                            <p><strong>Startdatum:</strong> ${schedule.startDate}</p>
                            <p><strong>Slutdatum:</strong> ${schedule.endDate}</p>
                        `;
                        scheduleList.appendChild(div);
                    }
                } else {
                    scheduleList.textContent = 'Inga scheman hittades för denna anställd.';
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
        }
    });

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
