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
                        detailsLink: `kund-detaljer.html?id=${projectDoc.id}`
                    });
                }
            }

            renderGanttChart(ganttData);
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    function renderGanttChart(ganttData) {
        ganttChartContainer.innerHTML = ''; // Töm tidigare innehåll

        // Här kan du använda en Gantt-diagramsbibliotek (t.ex. DHTMLX Gantt) för att rendera diagrammet
        ganttData.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('gantt-task');
            taskElement.innerHTML = `<a href="${task.detailsLink}">${task.text}</a> (${task.start_date} - ${task.end_date})`;
            ganttChartContainer.appendChild(taskElement);
        });
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
