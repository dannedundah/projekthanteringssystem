import { db, auth, onAuthStateChanged, doc, getDoc, collection, query, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Kontrollera användarens behörighet och ladda data endast för admin-användare
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // Använd samma rollkontroll som resten av systemet för att kontrollera admin-behörighet
                if (userData.role === 'Admin') {
                    // Ladda och visa data om användaren är admin
                    displayTotalHoursPerProject();
                } else {
                    // Omdirigera eller visa ett meddelande om användaren inte är admin
                    alert('Du har inte behörighet att se denna sida.');
                    window.location.href = 'index.html';
                }
            } else {
                console.error("Användardokumentet hittades inte.");
            }
        } else {
            // Omdirigera till inloggningssidan om användaren inte är inloggad
            window.location.href = 'login.html';
        }
    });

    // Funktion för att hämta och sammanställa totala timmar per projekt
    async function getTotalHoursPerProject() {
        const projects = {}; // Objekt för att lagra timmar per projekt
        const projectAddresses = {}; // Objekt för att lagra projektadresser

        try {
            const q = query(collection(db, 'timeReports'));
            const querySnapshot = await getDocs(q);

            // Iterera över alla tidrapporter och summera timmar per projekt
            for (const docSnapshot of querySnapshot.docs) {
                const reportData = docSnapshot.data();
                const projectId = reportData.projectId;
                const hours = parseFloat(reportData.hours) || 0;

                // Summera timmar för varje projekt
                if (projects[projectId]) {
                    projects[projectId] += hours;
                } else {
                    projects[projectId] = hours;

                    // Hämta projektadressen endast en gång per projekt
                    const projectDoc = await getDoc(doc(db, 'projects', projectId));
                    if (projectDoc.exists()) {
                        projectAddresses[projectId] = projectDoc.data().address || "Ej specificerad";
                    } else {
                        projectAddresses[projectId] = "Ej specificerad";
                    }
                }
            }

            // Omvandla objektet till en array med adresser och totala timmar
            const totalHoursPerProject = Object.keys(projects).map(projectId => ({
                address: projectAddresses[projectId],
                totalHours: projects[projectId]
            }));

            return totalHoursPerProject;

        } catch (error) {
            console.error("Error calculating total hours per project:", error);
        }
    }

    // Funktion för att visa de totala timmarna per projekt med adress
    async function displayTotalHoursPerProject() {
        const totalHoursPerProject = await getTotalHoursPerProject();
        const resultsContainer = document.getElementById('total-hours-container');
        resultsContainer.innerHTML = ''; // Rensa tidigare resultat

        // Skapa en lista med adresser och totalt antal timmar per projekt
        totalHoursPerProject.forEach(project => {
            const listItem = document.createElement('li');
            listItem.textContent = `Adress: ${project.address} - Totala timmar: ${project.totalHours}`;
            resultsContainer.appendChild(listItem);
        });
    }

    // Eventlistener för att visa timmarna när knappen klickas
    document.getElementById('show-total-hours').addEventListener('click', displayTotalHoursPerProject);
});
