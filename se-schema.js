import { db, collection, query, where, getDocs, doc, getDoc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ganttChartContainer = document.getElementById('gantt-chart');
    const projectList = document.getElementById('project-list');
    let selectedEmployeeName = null;

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
            const q = query(collection(db, 'planning'), where('employees', 'array-contains', selectedEmployeeName));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                projectList.innerHTML = '<li>Inga schemaposter hittades.</li>';
                return;
            }

            const ganttData = [];

            for (const docSnapshot of querySnapshot.docs) {
                const planningData = docSnapshot.data();
                const projectDocRef = doc(db, 'projects', planningData.projectId);
                const projectDoc = await getDoc(projectDocRef);

                if (projectDoc.exists()) {
                    const projectData = projectDoc.data();
                    const startDate = formatDate(planningData.startDate);
                    const endDate = formatDate(planningData.endDate);

                    ganttData.push({
                        id: docSnapshot.id,
                        text: projectData.address || 'Ej specificerad',
                        start_date: startDate,
                        end_date: endDate,
                        detailsLink: `projekt-detalj.html?id=${projectDoc.id}`,
                        startDateObj: new Date(startDate) // Spara som Date-objekt för sortering
                    });
                }
            }

            // Sortera projekten baserat på startdatum (närmast först)
            ganttData.sort((a, b) => a.startDateObj - b.startDateObj);

            // Visa projekten i en lista
            projectList.innerHTML = ganttData.map(task => `
                <li data-id="${task.id}">
                    <strong>${task.text}</strong><br>
                    Startdatum: ${task.start_date}<br>
                    Slutdatum: ${task.end_date}
                </li>
            `).join('');

            // Lägg till klickhantering för att gå till projektets detaljer
            document.querySelectorAll('#project-list li').forEach(item => {
                item.addEventListener('click', () => {
                    const taskId = item.getAttribute('data-id');
                    const task = ganttData.find(task => task.id === taskId);
                    if (task && task.detailsLink) {
                        window.location.href = task.detailsLink;
                    }
                });
            });

            renderGanttChart(ganttData);
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    function formatDate(date) {
        if (date.seconds) {
            const d = new Date(date.seconds * 1000);
            return d.toISOString().split('T')[0];
        } else if (typeof date === 'string') {
            return date;
        } else {
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        }
    }

    function renderGanttChart(ganttData) {
        ganttChartContainer.innerHTML = '';
        
        gantt.config.xml_date = "%Y-%m-%d";
        gantt.config.readonly = true;
        gantt.config.fit_tasks = true; // Gör att uppgifterna fyller hela diagrammet
        gantt.config.grid_width = window.innerWidth < 768 ? 0 : 300; // Dölj rutnätet på små skärmar

        gantt.init("gantt-chart");
        
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
