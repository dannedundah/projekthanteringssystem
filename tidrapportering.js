import { db, collection, query, where, getDocs, addDoc, doc, getDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const timeReportForm = document.getElementById('time-report-form');
    const selectedDateHeader = document.getElementById('selected-date');
    const projectDropdown = document.getElementById('project-dropdown');
    const timeTypeDropdown = document.getElementById('time-type');
    const hoursInput = document.getElementById('hours');
    let selectedEmployeeName = null;
    let selectedDate = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                selectedEmployeeName = `${userData.firstName} ${userData.lastName}`;
                console.log(`Logged in as: ${selectedEmployeeName}`);

                generateCalendar(new Date().getFullYear(), new Date().getMonth());
                await loadProjects();
            } else {
                console.error('User document not found.');
            }
        } else {
            console.error('User not logged in');
        }
    });

    function generateCalendar(year, month) {
        calendar.innerHTML = ''; // Rensa kalendern
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let dayNumber = 1;

        for (let i = 0; i < 6; i++) { // Kalendern består av 6 rader
            const row = document.createElement('div');
            row.className = 'calendar-row';

            for (let j = 0; j < 7; j++) { // Veckan har 7 dagar
                const cell = document.createElement('div');
                cell.className = 'calendar-cell';

                if (i === 0 && j < firstDay) {
                    cell.className += ' empty-cell';
                } else if (dayNumber > daysInMonth) {
                    cell.className += ' empty-cell';
                } else {
                    cell.textContent = dayNumber;
                    cell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

                    cell.addEventListener('click', () => {
                        selectedDate = cell.dataset.date;
                        selectedDateHeader.textContent = `Rapportera tid för ${selectedDate}`;
                        timeReportForm.style.display = 'block';
                    });

                    dayNumber++;
                }

                row.appendChild(cell);
            }

            calendar.appendChild(row);
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
