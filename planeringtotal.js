import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initiera auth och db
const auth = getAuth();
const db = getFirestore();

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

            // Sortera plannings baserat på startdatum
            plannings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            // Ladda och fyll team dropdown
            const teamsSnapshot = await getDocs(collection(db, 'teams'));
            allTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            populateTeamSelect();
            renderGanttChart(plannings);

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
        teamSelect.innerHTML += '<option value="Elektriker">Elektriker</option>'; // Elektriker som separat kategori

        allTeams.forEach(team => {
            if (team.name !== 'Team Admin') { // Dölj "Team Admin"
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
            filteredPlannings = plannings.filter(planning => 
                planning.electricianStartDate && 
                planning.electricianEndDate && 
                planning.projectId !== hiddenProjectId
            );
        } else if (selectedTeam === "") {
            filteredPlannings = plannings.filter(planning => planning.projectId !== hiddenProjectId);
        } else {
            filteredPlannings = plannings.filter(planning => 
                planning.team === selectedTeam && 
                planning.projectId !== hiddenProjectId
            );
        }

        // Sortera filteredPlannings baserat på startdatum
        filteredPlannings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        renderGanttChart(filteredPlannings, selectedTeam === "Elektriker");
    }

    async function renderGanttChart(plannings, isElectricianView = false) {
        ganttChartContainer.innerHTML = '';

        gantt.config.xml_date = "%Y-%m-%d";
        gantt.config.readonly = !canEdit;

        gantt.init("gantt-chart");

        const tasks = await Promise.all(plannings.map(async planning => {
            const projectDocRef = doc(db, 'projects', planning.projectId);
            const projectDoc = await getDoc(projectDocRef);
            if (projectDoc.exists()) {
                const projectData = projectDoc.data();

                // Filtrera bort projekt med status "Driftsatt"
                if (projectData.status.trim().toLowerCase() === 'driftsatt') {
                    return []; // Hoppa över detta projekt
                }
                // Filtrera bort projekt med status "Fakturerad"
                if (projectData.status.trim().toLowerCase() === 'fakturerad') {
                    return []; // Hoppa över detta projekt
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

                if (isElectricianView) {
                    const startDate = formatDateToString(planning.electricianStartDate);
                    let endDate = formatDateToString(planning.electricianEndDate);

                    if (!startDate || !endDate) {
                        console.error("Invalid start or end date for planning:", planning);
                        return [];
                    }

                    taskList.push({
                        id: planning.id + '-electrician',
                        text: projectData.address || 'Ej specificerad',
                        start_date: startDate,
                        end_date: endDate, 
                        detailsLink: `projekt-detalj.html?id=${planning.projectId}`,
                        color: "#FFD700"
                    });
                } else {
                    const startDate = formatDateToString(planning.startDate);
                    let endDate = formatDateToString(planning.endDate);

                    if (!startDate || !endDate) {
                        console.error("Invalid start or end date for planning:", planning);
                        return [];
                    }

                    // Lägg till en dag för att säkerställa att hela perioden visas
                    const adjustedEndDate = addOneDay(endDate);

                    taskList.push({
                        id: planning.id,
                        text: projectData.address || 'Ej specificerad',
                        start_date: startDate,
                        end_date: adjustedEndDate, // Använd det justerade slutdatumet
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

        gantt.attachEvent("onTaskDrag", function(id, mode, task, original) {
            return true;
        });

        gantt.attachEvent("onAfterTaskUpdate", async function(id, item) {
            await saveTaskDates(id);
            showConfirmationPopup("Projekt uppdaterat!");
        });
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

    function addOneDay(date) {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }

    async function saveTaskDates(taskId) {
        const task = gantt.getTask(taskId);

        const startDate = new Date(Date.UTC(task.start_date.getFullYear(), task.start_date.getMonth(), task.start_date.getDate()));
        const endDate = new Date(Date.UTC(task.end_date.getFullYear(), task.end_date.getMonth(), task.end_date.getDate()));

        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        const planningRef = doc(db, 'planning', taskId.replace('-electrician', ''));

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

        // Uppdatera status för projektet till "Planerad"
        const projectRef = doc(db, 'projects', taskId.replace('-electrician', ''));
        await updateDoc(projectRef, {
            status: 'Planerad'
        });
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
