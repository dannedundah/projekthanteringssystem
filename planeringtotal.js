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

    const hiddenProjectId = "moBgPPK2jgyZaeBnqza1";

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
        gantt.config.readonly = !canEdit;

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
            { name: "checkbox", label: "", width: 30, template: checkboxTemplate }, 
            { name: "text", label: "Task name", width: 270, tree: true }, 
            { name: "start_date", label: "Start time", align: "center", width: 80 },
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
                        color: taskColor,  // ANVÄND SAMMA LOGIK FÖR FÄRG SOM ÖVRIGA PROJEKT
                        checkbox: planning.electricianChecked || false  // Sätt initialt checkbox-värde
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
            if (e.target.type === 'checkbox') {
                const isChecked = e.target.checked;
                task.checkbox = isChecked;
                saveCheckboxState(task.id, isChecked);
                e.stopPropagation();
                return true;
            } else if (e.target.closest('.gantt_cell')) {
                window.location.href = task.detailsLink;
                return false;
            }
            return true;
        });

        gantt.attachEvent("onTaskDrag", function(id, mode, task, original) {
            return true;
        });

        gantt.attachEvent("onAfterTaskUpdate", async function(id, item) {
            await saveTaskDates(id);
            showConfirmationPopup("Projekt uppdaterat!");
        });

        function checkboxTemplate(task) {
            if (task.checkbox !== undefined) {
                const checked = task.checkbox ? 'checked' : '';
                return `<input type="checkbox" class="electrician-checkbox" ${checked}>`;
            }
            return '';
        }
    }

    async function saveCheckboxState(taskId, isChecked) {
        const planningRef = doc(db, 'planning', taskId.replace('-electrician', ''));
        try {
            await updateDoc(planningRef, {
                electricianChecked: isChecked
            });
            console.log(`Checkbox state saved successfully for task: ${taskId}`);
        } catch (error) {
            console.error("Error updating checkbox state: ", error);
        }
    }

    async function saveTaskDates(taskId) {
        const task = gantt.getTask(taskId);

        const startDate = new Date(Date.UTC(task.start_date.getFullYear(), task.start_date.getMonth(), task.start_date.getDate()));
        const endDate = new Date(Date.UTC(task.end_date.getFullYear(), task.end_date.getMonth(), task.end_date.getDate()));

        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        console.log(`Saving dates for task: ${taskId}`);
        console.log(`Start Date: ${formattedStartDate}, End Date: ${formattedEndDate}`);

        const planningRef = doc(db, 'planning', taskId.replace('-electrician', ''));

        try {
            const planningDoc = await getDoc(planningRef);

            if (planningDoc.exists()) {
                if (taskId.endsWith('-electrician')) {
                    await updateDoc(planningRef, {
                        electricianStartDate: formattedStartDate,
                        electricianEndDate: formattedEndDate
                    });
                } else {
                    await updateDoc(planningRef, {
                        startDate: formattedStartDate,
                        endDate: formattedEndDate
                    });
                }

                console.log(`Dates saved successfully for task: ${taskId}`);

                const projectId = planningDoc.data().projectId;
                if (!projectId) {
                    console.error(`No projectId found in planning document for taskId: ${taskId}`);
                    return;
                }

                const projectRef = doc(db, 'projects', projectId);
                const projectDoc = await getDoc(projectRef);

                if (projectDoc.exists()) {
                    await updateDoc(projectRef, {
                        status: 'Planerad'
                    });
                } else {
                    console.error(`No project document found for projectId: ${projectId}`);
                }
            } else {
                console.error(`No planning document found for taskId: ${taskId}`);
            }
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }

    function formatDateToString(date) {
        if (!date) {
            console.error("Invalid date:", date);
            return null;
        }

        if (date.seconds) {
            const d = new Date(date.seconds * 1000);
            return d.toISOString().split('T')[0];
        }

        if (typeof date === 'string') {
            return date;
        }

        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        return d.toISOString().split('T')[0];
    }

    function showConfirmationPopup(message) {
        const popup = document.createElement('div');
        popup.classList.add('confirmation-popup');
        popup.textContent = message;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('show');
        }, 100);

        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }, 3000);
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
