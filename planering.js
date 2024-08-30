import { db, collection, getDocs, addDoc, query, where, doc, updateDoc, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const planningForm = document.getElementById('planning-form');
    const projectDropdown = document.getElementById('project-id');
    const teamDropdown = document.getElementById('team-id');
    const employeeDropdowns = [
        document.getElementById('employee-id-1'),
        document.getElementById('employee-id-2'),
        document.getElementById('employee-id-3'),
        document.getElementById('employee-id-4')
    ];

    if (!projectDropdown || !teamDropdown || employeeDropdowns.some(dropdown => !dropdown)) {
        console.error('One or more dropdown elements are not found.');
        return;
    }

    try {
        // Fetch projects with status "Ny"
        const projectsQuery = query(collection(db, 'projects'), where('status', '==', 'Ny'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectDropdown.appendChild(option);
        });

        // Fetch teams
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.name;
            option.textContent = team.name;
            teamDropdown.appendChild(option);
        });

        // Handle team selection to populate employees
        teamDropdown.addEventListener('change', () => {
            const selectedTeam = teamDropdown.value;

            // Clear existing employees in all dropdowns
            employeeDropdowns.forEach(dropdown => {
                dropdown.innerHTML = '<option value="">Välj anställd</option>';
            });

            // Find the selected team
            const team = teams.find(t => t.name === selectedTeam);

            if (team && Array.isArray(team.members)) {
                // Populate employees if team and members exist
                team.members.forEach(member => {
                    employeeDropdowns.forEach(dropdown => {
                        const option = document.createElement('option');
                        option.value = member;
                        option.textContent = member;
                        dropdown.appendChild(option);
                    });
                });
            } else {
                console.warn(`Team ${selectedTeam} has no members or members are not defined.`);
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectId = projectDropdown.value.trim();
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const electricianStartDate = document.getElementById('electrician-start-date').value;
        const electricianEndDate = document.getElementById('electrician-end-date').value;
        const selectedTeam = teamDropdown.value;

        // Collect selected employees
        const selectedEmployees = employeeDropdowns.map(dropdown => dropdown.value).filter(employee => employee !== '');

        const planning = {
            projectId,
            startDate,
            endDate,
            electricianStartDate,
            electricianEndDate,
            team: selectedTeam,
            employees: selectedEmployees,
        };

        try {
            // Save planning
            await addDoc(collection(db, 'planning'), planning);

            // Check if project exists and update its status
            const projectRef = doc(db, 'projects', projectId);
            const projectDoc = await getDoc(projectRef);

            if (projectDoc.exists()) {
                await updateDoc(projectRef, {
                    status: 'Planerad'
                });
                alert('Planering sparad och projektstatus uppdaterad till "Planerad"!');
            } else {
                console.error(`Project with ID ${projectId} not found.`);
                alert('Planering sparad, men kunde inte uppdatera projektstatus eftersom projektet inte hittades.');
            }

            planningForm.reset();
        } catch (error) {
            console.error('Error saving planning or updating project status:', error);
            alert('Ett fel uppstod vid sparandet av planeringen eller uppdatering av projektstatus.');
        }
    });

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
