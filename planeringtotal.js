import { 
    auth, 
    db, 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc, 
    onAuthStateChanged 
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const ganttChartContainer = document.getElementById('gantt-chart');
    const teamSelect = document.getElementById('employee-select'); 
    let plannings = [];
    let allTeams = [];
    let canEdit = false;

    const hiddenProjectId = "moBgPPK2jgyZaeBnqza1"; // Dölj projekt med detta ID

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                canEdit = ["daniel@delidel.se", "sofie@delidel.se", "leia@delidel.se"].includes(user.email);
                await initializePage();
            } else {
                console.error('User document not found.');
            }
        } else {
            console.error('User not logged in');
            navigateTo('login.html');
        }
    });

    async function initializePage() {
        try {
            const querySnapshot = await getDocs(collection(db, 'planning'));
            plannings = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(planning => planning.projectId !== hiddenProjectId);

            plannings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            const teamsSnapshot = await getDocs(collection(db, 'teams'));
            allTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            populateTeamSelect();
            filterAndRenderGantt("");  

            teamSelect.addEventListener('change', () => {
                const selectedTeam = teamSelect.value;
                filterAndRenderGantt(selectedTeam);
            });

        } catch (error) {
            console.error('Error fetching plannings:', error);
        }
    }

    function populateTeamSelect() {
        teamSelect.innerHTML = '<option value="">Alla team</option>';
        teamSelect.innerHTML += '<option value="Elektriker">Elektriker</option>'; 

        allTeams.forEach(team => {
            if (team.name !== 'Team Admin') { 
                const option = document.createElement('option');
                option.value = team.name;
                option.textContent = team.name;
                teamSelect.appendChild(option);
            }
        });
    }

    function filterAndRenderGantt(selectedTeam) {
        let filteredPlannings = [];

        if (selectedTeam === "Elektriker") {
            filteredPlannings = plannings
                .filter(planning => 
                    planning.electricianStartDate && 
                    planning.electricianEndDate && 
                    planning.projectId !== hiddenProjectId
                )
                .sort((a, b) => new Date(a.electricianStartDate) - new Date(b.electricianStartDate));
        } else if (selectedTeam === "") {
            const validTeams = ["Team Rickard", "Team Marcus", "Team Reza"];
            filteredPlannings = plannings
                .filter(planning => 
                    validTeams.includes(planning.team) && 
                    planning.projectId !== hiddenProjectId
                )
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        } else {
            filteredPlannings = plannings
                .filter(planning => 
                    planning.team === selectedTeam && 
                    planning.projectId !== hiddenProjectId
                )
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        }

        renderGanttChart(filteredPlannings, selectedTeam === "Elektriker");
    }

    async function renderGanttChart(plannings, isElectricianView = false) {
        ganttChartContainer.innerHTML = '';

        gantt.config.xml_date = "%Y-%m-%d";
        gantt.config.readonly = !canEdit;  // Tillåt redigering om användaren har rättigheter

        // Aktivera drag och storleksändring av uppgifter
        gantt.config.drag_move = true;  // Tillåter att uppgifter flyttas
        gantt.config.drag_resize = true;  // Tillåter ändring av start- och slutdatum genom att dra

        gantt.templates.scale_cell_class = function(date){
            if(date.getDay() === 0 || date.getDay() === 6){
                return "weekend";
            }
        };

        gantt.templates.timeline_cell_class = function(item, date){
            if(date.getDay() === 0 || date.getDay() === 6){
                return "weekend";
            }
        };

        gantt.config.columns = [
            { name: "text", label: "Task name", width: 250, tree: true }, 
            { name: "start_date", label: "Start time", align: "center", width: 100 },
            { name: "duration", label: "Duration", align: "center", width: 60 }
        ];

        gantt.init("gantt-chart");

        const tasks = await Promise.all(plannings.map(async planning => {
            const projectDocRef = doc(db, 'projects', planning.projectId);
            const projectDoc = await getDoc(projectDocRef);
            if (projectDoc.exists()) {
                const projectData = projectDoc.data();

                if (['driftsatt', 'fakturerad'].includes(projectData.status.trim().toLowerCase())) {
                    return []; 
                }

                const taskList = [];
                let taskColor;
                switch (projectData.status.trim().toLowerCase()) {
                    case 'ny':
                        taskColor = 'pink';
                        break;
                    case 'planerad':
                        taskColor = 'blue';
                        break;
                    case 'solceller klart':
                        taskColor = 'brown';
                        break;
                    case 'elektriker klar':
                        taskColor = 'purple';
                        break;
                        case 'elektriker klar men inte solceller':
                        taskColor = 'yellow';
                        break;
                    case 'driftsatt':
                        taskColor = 'green';
                        break;
                    case 'fakturerad':
                        taskColor = 'black';
                        break;
                    default:
                        taskColor = 'grey'; 
                }

                const teamName = planning.team || 'Ej specificerat team';

                if (isElectricianView) {
                    const startDate = formatDateToString(planning.electricianStartDate);
                    const endDate = formatDateToString(planning.electricianEndDate);

                    if (!startDate || !endDate) {
                        console.error("Invalid start or end date for planning:", planning);
                        return [];
                    }

                    taskList.push({
                        id: planning.id + '-electrician',
                        text: `${projectData.name} (${teamName})`,  
                        start_date: startDate,
                        end_date: endDate, 
                        detailsLink: `projekt-detalj.html?id=${planning.projectId}`,
                        color: taskColor
                    });
                } else {
                    const startDate = formatDateToString(planning.startDate);
                    const endDate = formatDateToString(planning.endDate);

                    if (!startDate || !endDate) {
                        console.error("Invalid start or end date for planning:", planning);
                        return [];
                    }

                    taskList.push({
                        id: planning.id,
                        text: `${projectData.name} (${teamName})`,  
                        start_date: startDate,
                        end_date: endDate,
                        detailsLink: `projekt-detalj.html?id=${planning.projectId}`,
                        color: taskColor
                    });
                }

                return taskList;
            }
            return [];
        }));

        gantt.clearAll();
        gantt.parse({
            data: tasks.flat(),
            links: []
        });

        gantt.attachEvent("onTaskClick", function(id, e) {
            const task = gantt.getTask(id);
            if (e.target.closest('.gantt_cell')) {
                window.location.href = task.detailsLink;
                return false;
            }
            return true;
        });

        gantt.attachEvent("onAfterTaskUpdate", async function(id, item) {
            await saveTaskDates(id);
            showConfirmationPopup("Projekt uppdaterat!");
        });
    }

    async function saveTaskDates(taskId) {
        const task = gantt.getTask(taskId);

        const startDate = new Date(Date.UTC(task.start_date.getFullYear(), task.start_date.getMonth(), task.start_date.getDate()));
        const endDate = new Date(Date.UTC(task.end_date.getFullYear(), task.end_date.getMonth(), task.end_date.getDate()));

        const planningRef = doc(db, 'planning', taskId.replace('-electrician', ''));

        try {
            if (taskId.endsWith('-electrician')) {
                await updateDoc(planningRef, {
                    electricianStartDate: startDate.toISOString().split('T')[0],
                    electricianEndDate: endDate.toISOString().split('T')[0]
                });
            } else {
                await updateDoc(planningRef, {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                });
            }

            console.log('Task dates saved successfully for task:', taskId);
        } catch (error) {
            console.error('Error updating task dates:', error);
        }
    }

    function formatDateToString(date) {
        if (!date) {
            return null;
        }

        return gantt.date.date_to_str("%Y-%m-%d")(new Date(date));
    }

    function showConfirmationPopup(message) {
        const popup = document.createElement('div');
        popup.classList.add('confirmation-popup');
        popup.textContent = message;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
