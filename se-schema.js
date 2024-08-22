import { db, collection, query, where, getDocs, doc, getDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ganttChartContainer = document.getElementById('gantt-chart');
    let selectedEmployeeName = null;

    // Kontrollera vem som är inloggad och ladda deras schema
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                selectedEmployeeName = `${userData.firstName} ${userData.lastName}`;
                console.log(`Logged in as: ${selectedEmployeeName}`);

                await loadSchedule();
            } else {
                console.error('User document not found.');
            }
        } else {
            console.error('User not logged in');
            navigateTo('login.html');
        }
    });

    async function loadSchedule() {
        try {
            // Query för att hämta schemat för den inloggade användaren
            const q = query(collection(db, 'planning'), where('employees', 'array-contains', selectedEmployeeName));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                ganttChartContainer.innerHTML = '<p>Inga schemaposter hittades.</p>';
                return;
            }

            const ganttData = [];

            for (const docSnapshot of querySnapshot.docs) {
                const planningData = docSnapshot.data();
                const projectDocRef = doc(db, 'projects', planningData.projectId);
                const projectDoc = await getDoc(projectDocRef);

                if (projectDoc.exists()) {
                    const projectData = projectDoc.data();
                    ganttData.push({
                        id: docSnapshot.id,
                        text: projectData.address || 'Ej specificerad',
                        start_date: planningData.startDate,
                        end_date: planningData.endDate,
                        detailsLink: `projekt-detalj.html?id=${projectDoc.id}` // Uppdaterad länk
                    });
                }
            }

            renderGanttChart(ganttData);
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    function renderGanttChart(ganttData) {
        ganttChartContainer.innerHTML = ''; // Töm tidigare innehåll om det behövs
        
        // Konfigurera Gantt-diagrammet
        gantt.config.xml_date = "%Y-%m-%d"; // Ange datumformatet

        // Anpassa utseendet och beteendet på Gantt-diagrammet här om nödvändigt
        gantt.init("gantt-chart"); // Initialisera Gantt-diagrammet i rätt container
        
        // Ladda data i Gantt-diagrammet
        gantt.parse({
            data: ganttData.map(task => ({
                id: task.id,
                text: task.text,
                start_date: task.start_date,
                end_date: task.end_date,
                detailsLink: task.detailsLink
            })),
            links: []
        });

        // Lägg till en klickhändelse på varje uppgift
        gantt.attachEvent("onTaskClick", function(id, e) {
            const task = gantt.getTask(id);
            if (task && task.detailsLink) {
                window.location.href = task.detailsLink;
            }
            return true;
        });
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
