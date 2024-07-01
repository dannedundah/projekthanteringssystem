import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const employeeDropdown = document.getElementById('employee-dropdown');
    const scheduleContainer = document.getElementById('schedule-container');

    employeeDropdown.addEventListener('change', async (e) => {
        const selectedEmployee = e.target.value;
        scheduleContainer.innerHTML = '';

        try {
            const querySnapshot = await getDocs(collection(db, 'planning'));
            const schedules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const filteredSchedules = schedules.filter(schedule => schedule.employees.includes(selectedEmployee));

            filteredSchedules.forEach(schedule => {
                const projectElement = document.createElement('div');
                projectElement.innerHTML = `
                    <p><strong>Projekt:</strong> ${schedule.projectId}</p>
                    <p><strong>Startdatum:</strong> ${schedule.startDate}</p>
                    <p><strong>Slutdatum:</strong> ${schedule.endDate}</p>
                `;
                scheduleContainer.appendChild(projectElement);
            });

        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    });
});
