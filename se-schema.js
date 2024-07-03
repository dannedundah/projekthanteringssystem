import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    const employeeNameSelect = document.getElementById('employee-name');

    employeeNameSelect.addEventListener('change', () => {
        showSchedule();
    });

    async function showSchedule() {
        const employeeName = employeeNameSelect.value;
        if (employeeName === '') return;

        try {
            const querySnapshot = await getDocs(collection(db, "schedules"));
            const schedules = querySnapshot.docs.map(doc => doc.data());
            const employeeSchedules = schedules.filter(schedule => schedule.name === employeeName || employeeName === '');

            scheduleContainer.innerHTML = '';
            if (employeeSchedules.length > 0) {
                const table = createGanttTable(employeeSchedules);
                scheduleContainer.appendChild(table);
            } else {
                scheduleContainer.textContent = 'Inga scheman hittades för denna anställd.';
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    }

    function createGanttTable(schedules) {
        const table = document.createElement('table');
        const headerRow = table.insertRow();

        const nameHeader = headerRow.insertCell();
        nameHeader.textContent = 'Namn:';

        const dates = getDatesForWeek();
        dates.forEach(date => {
            const cell = headerRow.insertCell();
            cell.textContent = date.toISOString().split('T')[0];
        });

        const employeeNames = ['Alireza', 'Andreas', 'Hampus', 'Loa', 'Marcus', 'Mustafa', 'Noah', 'Reza', 'Rickard'];
        employeeNames.forEach(name => {
            const row = table.insertRow();
            const nameCell = row.insertCell();
            nameCell.textContent = name;

            dates.forEach(date => {
                const cell = row.insertCell();
                const schedule = schedules.find(schedule => schedule.name === name && new Date(schedule.startDate) <= date && new Date(schedule.endDate) >= date);
                if (schedule) {
                    cell.textContent = schedule.projectId;
                    cell.style.backgroundColor = 'green'; // Customize as needed
                }
            });
        });

        return table;
    }

    function getDatesForWeek() {
        const today = new Date();
        const startOfWeek = today.getDate() - today.getDay() + 1;
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today.setDate(startOfWeek + i));
            dates.push(date);
        }
        return dates;
    }
});
