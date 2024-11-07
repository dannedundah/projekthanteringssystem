import { db, auth, onAuthStateChanged, doc, getDoc, collection, query, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Kontrollera användarbehörighet
    function checkAdminPrivileges() {
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (userData.role === 'admin') {
                            resolve(true); // Användaren är admin
                        } else {
                            alert('Du har inte behörighet att se denna sida.');
                            window.location.href = 'index.html'; // Omdirigera om ej admin
                            resolve(false);
                        }
                    } else {
                        reject('Användardokument hittades inte.');
                    }
                } else {
                    window.location.href = 'login.html'; // Omdirigera till login om ej inloggad
                    resolve(false);
                }
            });
        });
    }

    // Hämta och visa sammanställningen av timmar per projekt endast om användaren är admin
    checkAdminPrivileges().then((isAdmin) => {
        if (isAdmin) {
            // Funktion för att hämta och sammanställa totala timmar per projekt
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

            // Funktion för att visa de totala timmarna per projekt
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
        }
    });
});
