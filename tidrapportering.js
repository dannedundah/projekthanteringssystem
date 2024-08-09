import { db, collection, query, where, getDocs, addDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const timeReportForm = document.getElementById('time-report-form');
    const projectDropdown = document.getElementById('project-dropdown');
    const timeTypeDropdown = document.getElementById('time-type');
    const hoursInput = document.getElementById('hours');
    const dateInput = document.getElementById('date');
    let selectedEmployeeEmail = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            selectedEmployeeEmail = user.email;
            console.log("Logged in as:", selectedEmployeeEmail); // Lägg till detta för felsökning

            if (selectedEmployeeEmail) {
                try {
                    const employeeProjects = [];
                    const q = query(collection(db, 'planning'), where('employees', 'array-contains', selectedEmployeeEmail));
                    const querySnapshot = await getDocs(q);

                    querySnapshot.forEach(doc => {
                        employeeProjects.push({ id: doc.id, ...doc.data() });
                    });

                    if (employeeProjects.length > 0) {
                        projectDropdown.innerHTML = '<option value="">Välj projekt</option>';
                        employeeProjects.forEach(project => {
                            const option = document.createElement('option');
                            option.value = project.projectId;
                            option.textContent = project.projectAddress || 'Ej specificerad';
                            projectDropdown.appendChild(option);
                        });
                    } else {
                        console.log('No projects found for the user');
                    }
                } catch (error) {
                    console.error('Error fetching projects:', error);
                }
            } else {
                console.error('User email is undefined');
            }
        } else {
            console.error('User not logged in');
        }
    });

    timeReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedProjectId = projectDropdown.value;
        const timeType = timeTypeDropdown.value;
        const hours = parseFloat(hoursInput.value);
        const date = dateInput.value;

        if (selectedProjectId && timeType && hours && date) {
            const timeReport = {
                projectId: selectedProjectId,
                timeType,
                hours,
                date,
                employee: selectedEmployeeEmail
            };

            try {
                await addDoc(collection(db, 'timeReports'), timeReport);
                alert('Tidrapporten har sparats!');
                timeReportForm.reset();
                projectDropdown.innerHTML = '<option value="">Välj projekt</option>';
            } catch (error) {
                console.error('Error adding time report:', error);
                alert('Ett fel uppstod vid sparandet av tidrapporten.');
            }
        } else {
            alert('Vänligen fyll i alla fält.');
        }
    });
});

window.navigateTo = (page) => {
    window.location.href = page;
};
