import { db, collection, getDocs, addDoc } from './firebase-config.js';

export async function autoScheduleProject(projectId, panelCount, teamSize, travelTimeMinutes) {
    const validTeams = ["Team Marcus", "Team Rickard", "Team Mustafa"];  // Endast dessa team ska schemaläggas automatiskt

    try {
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        const teams = teamsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(team => validTeams.includes(team.name));  // Filtrera endast de relevanta teamen

        const planningsSnapshot = await getDocs(collection(db, 'planning'));
        const plannings = planningsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (const team of teams) {
            const teamPlannings = plannings.filter(p => p.team === team.name);
            let lastEndDate = teamPlannings.length > 0 ? 
                new Date(Math.max(...teamPlannings.map(p => new Date(p.endDate)))) : 
                new Date(); 

            const projectDuration = calculateProjectDuration(panelCount, teamSize);
            let startDate = getNextWorkingDay(lastEndDate);
            let endDate = startDate;

            for (let i = 0; i < projectDuration; i++) {
                endDate = getNextWorkingDay(endDate);
            }

            await addDoc(collection(db, 'planning'), {
                projectId,
                team: team.name,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                employees: team.members
            });

            await autoScheduleElectrician(projectId, endDate);
            break;  // Avsluta loopen efter att ett team har schemalagts
        }
    } catch (error) {
        console.error('Error scheduling project:', error);
    }
}

async function autoScheduleElectrician(projectId, projectEndDate) {
    const electricianName = "Elektriker";
    let electricianBookings = [];

    const electricianPlanningsSnapshot = await getDocs(collection(db, 'planning'));
    const electricianPlannings = electricianPlanningsSnapshot.docs.filter(
        doc => doc.data().team === electricianName
    );
    
    electricianBookings = electricianPlannings.filter(p => {
        const startDate = new Date(p.electricianStartDate);
        return startDate.toISOString().split('T')[0] === projectEndDate.toISOString().split('T')[0];
    });

    if (electricianBookings.length < 2) {
        const electricianStartDate = projectEndDate;
        const electricianEndDate = getNextWorkingDay(electricianStartDate);

        await addDoc(collection(db, 'planning'), {
            projectId,
            team: electricianName,
            electricianStartDate: electricianStartDate.toISOString().split('T')[0],
            electricianEndDate: electricianEndDate.toISOString().split('T')[0]
        });

        console.log(`Elektriker schemalagd på projekt ${projectId}`);
    } else {
        console.warn(`Elektrikern är redan bokad för två projekt den dagen: ${projectEndDate}`);
    }
}

function calculateProjectDuration(panelCount, teamSize) {
    return Math.ceil((panelCount / 0.7) / teamSize);
}

function getNextWorkingDay(date) {
    let nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Exempel för att undvika helger, här kan du också lägga till logik för röda dagar
    while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
        nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate;
}
