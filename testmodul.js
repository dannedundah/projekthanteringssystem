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
                if (userData.role === 'Elektriker') {
                    alert('Du har inte behörighet att rapportera tid.');
                    window.location.href = 'index.html';
                    return;
                }

                selectedEmployeeName = `${userData.firstName} ${userData.lastName}`;
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
        const daysOfWeek = ["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"];
        monthYearHeader.textContent = `${monthNames[month]} ${year}`;
        calendar.innerHTML = `<tr>${daysOfWeek.map(day => `<th>${day}</th>`).join('')}</tr>`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = (firstDayOfMonth + 6) % 7;

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
                if (planningData.projectId) {
                    const projectDocRef = doc(db, 'projects', planningData.projectId);
                    const projectDoc = await getDoc(projectDocRef);

                    if (projectDoc.exists()) {
                        const projectData = projectDoc.data();
                        employeeProjects.push({ id: projectDoc.id, address: projectData.address });
                    }
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

            return {
                id: reportDoc.id,
                projectId: reportData.projectId,
                timeType: reportData.timeType,
                hours: reportData.hours,
                comment: reportData.comment
            };
        }

        return null;
    }

    async function getTotalHoursPerProject() {
        const projects = {};
        const projectAddresses = {};

        try {
            const q = query(collection(db, 'timeReports'));
            const querySnapshot = await getDocs(q);

            for (const docSnapshot of querySnapshot.docs) {
                const reportData = docSnapshot.data();
                const projectId = reportData.projectId;
                const hours = parseFloat(reportData.hours) || 0;

                if (projects[projectId]) {
                    projects[projectId] += hours;
                } else {
                    projects[projectId] = hours;

                    // Fetch project address only once per project
                    const projectDoc = await getDoc(doc(db, 'projects', projectId));
                    if (projectDoc.exists()) {
                        projectAddresses[projectId] = projectDoc.data().address || "Ej specificerad";
                    } else {
                        projectAddresses[projectId] = "Ej specificerad";
                    }
                }
            }

            const totalHoursPerProject = Object.keys(projects).map(projectId => ({
                address: projectAddresses[projectId],
                totalHours: projects[projectId]
            }));

            return totalHoursPerProject;

        } catch (error) {
            console.error("Error calculating total hours per project:", error);
        }
    }

    async function displayTotalHoursPerProject() {
        const totalHoursPerProject = await getTotalHoursPerProject();
        const resultsContainer = document.getElementById('total-hours-container');
        resultsContainer.innerHTML = '';

        totalHoursPerProject.forEach(project => {
            const listItem = document.createElement('li');
            listItem.textContent = `Adress: ${project.address} - Totala timmar: ${project.totalHours}`;
            resultsContainer.appendChild(listItem);
        });
    }

    document.getElementById('show-total-hours').addEventListener('click', displayTotalHoursPerProject);
});
