import { db, collection, query, where, getDocs, addDoc, doc, getDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const timeReportForm = document.getElementById('time-report-form');
    const selectedDateHeader = document.getElementById('selected-date');
    const projectDropdown = document.getElementById('project-dropdown');
    const timeTypeDropdown = document.getElementById('time-type');
    const hoursInput = document.getElementById('hours');
    const monthYearElement = document.getElementById('month-year');
    let selectedEmployeeName = null;
    let selectedDate = null;
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                selectedEmployeeName = `${userData.firstName} ${userData.lastName}`;
                console.log(`Logged in as: ${selectedEmployeeName}`);

                generateCalendar(currentYear, currentMonth);
                await loadProjects();
            } else {
                console.error('User document not found.');
            }
        } else {
            console.error('User not logged in');
        }
    });

    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentYear, currentMonth);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth);
    });

    function generateCalendar(year, month) {
        const monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
        const daysOfWeek = ["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"];
        
        // Update the month-year in the header
        monthYearElement.textContent = `${monthNames[month]} ${year}`;
        
        // Start with an empty calendar
        calendar.innerHTML = `<tr>${daysOfWeek.map(day => `<th>${day}</th>`).join('')}</tr>`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let dayNumber = 1;
        let row = document.createElement('tr');

        for (let i = 0; i < 42; i++) {
            const cell = document.createElement('td');

            if (i >= firstDay && dayNumber <= daysInMonth) {
                cell.textContent = dayNumber;
                cell.classList.add('calendar-cell');
                cell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

                cell.addEventListener('click', () => {
                    selectedDate = cell.dataset.date;
                    selectedDateHeader.textContent = `Rapportera tid för ${selectedDate}`;
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

    timeReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedProjectId = projectDropdown.value;
        const timeType = timeTypeDropdown.value;
        const hours = parseFloat(hoursInput.value);

        if (selectedProjectId && timeType && hours && selectedDate) {
            const timeReport = {
                projectId: selectedProjectId,
                timeType,
                hours,
                date: selectedDate,
                employee: selectedEmployeeName
            };

            try {
                await addDoc(collection(db, 'timeReports'), timeReport);
                alert('Tidrapporten har sparats!');
                timeReportForm.reset();
                projectDropdown.innerHTML = '<option value="">Välj projekt</option>';
                timeReportForm.style.display = 'none';
                markReportedDay(selectedDate);
            } catch (error) {
                console.error('Error adding time report:', error);
                alert('Ett fel uppstod vid sparandet av tidrapporten.');
            }
        } else {
            alert('Vänligen fyll i alla fält.');
        }
    });

    async function markReportedDay(date) {
        const cells = document.querySelectorAll(`.calendar-cell[data-date="${date}"]`);
        if (cells.length > 0) {
            cells[0].classList.add('reported');
        }
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
