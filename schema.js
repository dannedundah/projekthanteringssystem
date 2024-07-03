import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const viewScheduleForm = document.getElementById('view-schedule-form');
    const ganttContainer = document.getElementById('gantt-container');

    viewScheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = document.getElementById('employee-name').value;

        ganttContainer.innerHTML = ''; // Clear previous gantt chart

        if (employeeName) {
            try {
                const querySnapshot = await getDocs(collection(db, "schedules"));
                const schedules = querySnapshot.docs.map(doc => doc.data());

                const employeeSchedules = schedules.filter(schedule => schedule.name === employeeName);

                if (employeeSchedules.length > 0) {
                    renderGanttChart(employeeSchedules);
                } else {
                    ganttContainer.innerHTML = '<p>Inga scheman hittades för denna anställd.</p>';
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
                ganttContainer.innerHTML = '<p>Ett fel uppstod vid hämtning av scheman.</p>';
            }
        } else {
            try {
                const querySnapshot = await getDocs(collection(db, "schedules"));
                const schedules = querySnapshot.docs.map(doc => doc.data());

                renderGanttChart(schedules);
            } catch (error) {
                console.error('Error fetching schedules:', error);
                ganttContainer.innerHTML = '<p>Ett fel uppstod vid hämtning av scheman.</p>';
            }
        }
    });

    function renderGanttChart(schedules) {
        // Define start and end dates for the Gantt chart
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7);

        // Create table structure
        let table = '<table><tr><th>Anställd:</th>';
        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
            table += `<th>${d.toISOString().split('T')[0]}</th>`;
        }
        table += '</tr>';

        // Create rows for each employee
        const employees = ["Alireza", "Andreas", "Hampus", "Loa", "Marcus", "Mustafa", "Noah", "Rickard"];
        employees.forEach(employee => {
            table += `<tr><td>${employee}</td>`;
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const schedule = schedules.find(schedule => 
                    schedule.name === employee && 
                    new Date(schedule.startDate) <= d && 
                    new Date(schedule.endDate) >= d
                );
                if (schedule) {
                    table += `<td style="background-color: green;">${schedule.projectAddress}</td>`;
                } else {
                    table += '<td></td>';
                }
            }
            table += '</tr>';
        });

        table += '</table>';
        ganttContainer.innerHTML = table;
    }
});

function navigateTo(page) {
    window.location.href = page;
}
