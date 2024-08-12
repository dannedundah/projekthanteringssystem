import { db, collection, query, where, getDocs, addDoc, doc, getDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const timeReportForm = document.getElementById('time-report-form');
    const projectDropdown = document.getElementById('project-dropdown');
    const reportedDaysOverview = document.getElementById('reported-days-overview');
    const timeTypeDropdown = document.getElementById('time-type');
    const hoursInput = document.getElementById('hours');
    const dateInput = document.getElementById('date');
    let selectedEmployeeName = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                selectedEmployeeName = `${userData.firstName} ${userData.lastName}`;
                console.log(`Logged in as: ${selectedEmployeeName}`);

                try {
                    // Fetch projects related to the logged-in user
                    const q = query(collection(db, 'planning'), where('employees', 'array-contains', selectedEmployeeName));
                    const querySnapshot = await getDocs(q);

                    console.log('Fetched planning docs:', querySnapshot.docs.map(doc => doc.data()));

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

                    // Fetch and display reported days
                    fetchReportedDays(selectedEmployeeName);

                } catch (error) {
                    console.error('Error fetching projects:', error);
                }
            } else {
                console.error('User document not found.');
            }
        } else {
            console.error('User not logged in');
        }
    });

    async function fetchReportedDays(employeeName) {
        try {
            const q = query(collection(db, 'timeReports'), where('employee', '==', employeeName));
            const querySnapshot = await getDocs(q);
            const reportedDays = querySnapshot.docs.map(doc => doc.data().date);
            
            if (reportedDays.length > 0) {
                const daysList = reportedDays.map(day => `<li>${day}</li>`).join('');
                reportedDaysOverview.innerHTML = `<ul>${daysList}</ul>`;
            } else {
                reportedDaysOverview.innerHTML = 'Inga dagar med rapporterad tid.';
            }
        } catch (error) {
            console.error('Error fetching reported days:', error);
            reportedDaysOverview.innerHTML = 'Ett fel uppstod vid hämtning av rapporterade dagar.';
        }
    }

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
                employee: selectedEmployeeName
            };

            try {
                await addDoc(collection(db, 'timeReports'), timeReport);
                alert('Tidrapporten har sparats!');
                timeReportForm.reset();
                projectDropdown.innerHTML = '<option value="">Välj projekt</option>';
                fetchReportedDays(selectedEmployeeName); // Refresh the reported days overview
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
