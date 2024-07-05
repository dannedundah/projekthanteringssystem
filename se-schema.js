import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const ganttChart = document.getElementById('gantt-chart');
    const employeeDropdown = document.getElementById('employee-name');

    const renderSchedule = async (employeeName = '') => {
        try {
            const querySnapshot = await getDocs(collection(db, "schedules"));
            const schedules = querySnapshot.docs.map(doc => doc.data());
            const filteredSchedules = employeeName ? schedules.filter(schedule => schedule.name === employeeName) : schedules;

            ganttChart.innerHTML = '';
            if (filteredSchedules.length > 0) {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - startDate.getDay());
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);

                const daysOfWeek = [];
                for (let i = 0; i < 7; i++) {
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + i);
                    daysOfWeek.push(date.toISOString().split('T')[0]);
                }

                const table = document.createElement('table');
                table.classList.add('gantt-table');

                const headerRow = document.createElement('tr');
                headerRow.innerHTML = `<th>Anställd</th>${daysOfWeek.map(date => `<th>${date}</th>`).join('')}`;
                table.appendChild(headerRow);

                const employees = [...new Set(filteredSchedules.map(schedule => schedule.name))];

                employees.forEach(employee => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${employee}</td>${daysOfWeek.map(() => `<td></td>`).join('')}`;
                    filteredSchedules.filter(schedule => schedule.name === employee).forEach(schedule => {
                        const startDateIndex = daysOfWeek.indexOf(schedule.startDate);
                        const endDateIndex = daysOfWeek.indexOf(schedule.endDate);
                        if (startDateIndex !== -1 && endDateIndex !== -1) {
                            for (let i = startDateIndex; i <= endDateIndex; i++) {
                                row.cells[i + 1].style.backgroundColor = 'green';
                                row.cells[i + 1].innerText = schedule.projectAddress;
                            }
                        }
                    });
                    table.appendChild(row);
                });

                ganttChart.appendChild(table);
            } else {
                ganttChart.textContent = 'Inga scheman hittades för denna anställd.';
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    };

    viewScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = employeeDropdown.value.trim();
        renderSchedule(employeeName);
    });

    renderSchedule();

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
