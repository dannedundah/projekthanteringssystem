import { db, collection, query, where, getDocs, addDoc, doc, getDoc, auth, onAuthStateChanged, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const timeReportForm = document.getElementById('time-report-form');
    const selectedDateHeader = document.getElementById('selected-date');
    const projectDropdown = document.getElementById('project-dropdown');
    const timeTypeDropdown = document.getElementById('time-type');
    const hoursInput = document.getElementById('hours');
    const commentInput = document.getElementById('work-comment');
    const monthYearHeader = document.getElementById('month-year');
    let selectedEmployeeName = null;
    let selectedDate = null;
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let existingReportId = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Kontrollera om användaren har rollen "Elektriker"
                if (userData.role === 'Elektriker') {
                    alert('Du har inte behörighet att rapportera tid.');
                    window.location.href = 'index.html'; // Omdirigera till startsidan eller annan sida
                    return;
                }

                selectedEmployeeName = `${userData.firstName} ${userData.lastName}`;
                console.log(`Logged in as: ${selectedEmployeeName}`);

                generateCalendar(currentYear, currentMonth);
                await loadProjects();
                await markReportedDays(currentYear, currentMonth);
            } else {
                console.error('User document not found.');
            }
        } else {
            console.error('User not logged in');
        }
    });

    function generateCalendar(year, month) {
        const monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
        const daysOfWeek = ["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"];  // Rätt ordning för veckodagar

        monthYearHeader.textContent = `${monthNames[month]} ${year}`;

        calendar.innerHTML = `<tr>${daysOfWeek.map(day => `<th>${day}</th>`).join('')}</tr>`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = (firstDayOfMonth + 6) % 7; // Justera så att måndag är första dagen (0 = måndag)

        let dayNumber = 1;
        let row = document.createElement('tr');

        for (let i = 0; i < 42; i++) {
            const cell = document.createElement('td');

            if (i >= firstDayIndex && dayNumber <= daysInMonth) {
                cell.textContent = dayNumber;
                cell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

                cell.addEventListener('click', async () => {
                    selectedDate = cell.dataset.date;
                    const report = await getReportForDate(selectedDate);

                    if (report) {
                        existingReportId = report.id;
                        projectDropdown.value = report.projectId;
                        timeTypeDropdown.value = report.timeType;
                        hoursInput.value = report.hours;
                        commentInput.value = report.comment || '';
                        selectedDateHeader.textContent = `Ändra rapportering för ${selectedDate}`;
                    } else {
                        selectedDateHeader.textContent = `Rapportera tid för ${selectedDate}`;
                        timeReportForm.reset();
                        commentInput.value = '';
                        existingReportId = null;
                    }

                    timeReportForm.style.display = 'block';
                });

                dayNumber++;
            } else {
                cell.classList.add('empty-cell');
            }

            row.appendChild(cell);

            if ((i + 1) % 7 === 0) {
                calendar.appendChild(row);
                row = document.createElement('tr');
            }
        }
    }

    async function loadProjects() {
        try {
            const q = query(collection(db, 'planning'), where('employees', 'array-contains', selectedEmployeeName));
            const querySnapshot = await getDocs(q);

            const employeeProjects = [];

            for (const docSnapshot of querySnapshot.docs) {
                const planningData = docSnapshot.data();
                console.log('Processing planning data:', planningData);

                if (planningData.projectId) {
                    const projectDocRef = doc(db, 'projects', planningData.projectId);
                    const projectDoc = await getDoc(projectDocRef);

                    if (projectDoc.exists()) {
                        const projectData = projectDoc.data();
                        employeeProjects.push({ id: projectDoc.id, address: projectData.address });
                    } else {
                        console.log(`Project not found: ${planningData.projectId}`);
                    }
                } else {
                    console.log(`Missing projectId in planning document: ${docSnapshot.id}`);
                }
            }

            if (employeeProjects.length > 0) {
                projectDropdown.innerHTML = '<option value="">Välj projekt</option>';
                employeeProjects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.address || 'Ej specificerad';
                    projectDropdown.appendChild(option);
                });
            } else {
                console.log('No projects found for the user');
            }

        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    async function getReportForDate(date) {
        const q = query(
            collection(db, 'timeReports'),
            where('employee', '==', selectedEmployeeName),
            where('date', '==', date)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const reportDoc = querySnapshot.docs[0];
            const reportData = reportDoc.data();
            const projectDoc = await getDoc(doc(db, 'projects', reportData.projectId));
            const project = projectDoc.exists() ? projectDoc.data().address : 'Ej specificerad';

            return {
                id: reportDoc.id,
                projectId: reportData.projectId,
                project,
                timeType: reportData.timeType,
                hours: reportData.hours,
                comment: reportData.comment
            };
        }

        return null;
    }

    async function markReportedDays(year, month) {
        const weekdays = getWeekdaysInMonth(year, month);

        for (const day of weekdays) {
            const q = query(
                collection(db, 'timeReports'),
                where('employee', '==', selectedEmployeeName),
                where('date', '==', day)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const cell = document.querySelector(`[data-date="${day}"]`);
                if (cell) {
                    console.log("Marking reported day:", day); // Debug log
                    cell.classList.add('reported');
                }
            }
        }
    }

    function getWeekdaysInMonth(year, month) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const weekdays = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const day = date.getDay();
            if (day !== 0) { // Include all days except Sunday (0 = Sunday)
                weekdays.push(date.toISOString().split('T')[0]);
            }
        }
        console.log("Identified weekdays:", weekdays); // Debug log
        return weekdays;
    }

    document.getElementById('prev-month').addEventListener('click', async () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentYear, currentMonth);
        await loadProjects();  // Ladda om projekten när månaden ändras
        await markReportedDays(currentYear, currentMonth);
    });

    document.getElementById('next-month').addEventListener('click', async () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth);
        await loadProjects();  // Ladda om projekten när månaden ändras
        await markReportedDays(currentYear, currentMonth);
    });

    timeReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedProjectId = projectDropdown.value;
        const timeType = timeTypeDropdown.value;
        const hours = parseFloat(hoursInput.value);
        const comment = commentInput.value;

        if (selectedProjectId && timeType && hours && selectedDate) {
            const timeReport = {
                projectId: selectedProjectId,
                timeType,
                hours,
                date: selectedDate,
                employee: selectedEmployeeName,
                comment
            };

            try {
                if (existingReportId) {
                    const reportDocRef = doc(db, 'timeReports', existingReportId);
                    await updateDoc(reportDocRef, timeReport);
                    alert('Tidrapporten har uppdaterats!');
                } else {
                    await addDoc(collection(db, 'timeReports'), timeReport);
                    alert('Tidrapporten har sparats!');
                }

                timeReportForm.reset();
                projectDropdown.innerHTML = '<option value="">Välj projekt</option>';
                await loadProjects();  // Ladda om projekten efter att tid har rapporterats
                timeReportForm.style.display = 'none';
                markReportedDay(selectedDate);
            } catch (error) {
                console.error('Error saving time report:', error);
                alert('Ett fel uppstod vid sparandet av tidrapporten.');
            }
        } else {
            alert('Vänligen fyll i alla fält.');
        }
    });

    async function markReportedDay(date) {
        const cell = document.querySelector(`[data-date="${date}"]`);
        if (cell) {
            console.log("Marking reported day:", date); // Debug log
            cell.classList.add('reported');
        }
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
