import { db, collection, getDocs, addDoc } from './firebase-config.js';

export async function autoScheduleProject(projectId, panelCount, teamSize, travelTimeMinutes) {
    const redDays = ['2024-01-01', '2024-04-10'];  // Exempel på röda dagar

    function isWorkingDay(date) {
        const day = date.getDay();
        const dateString = date.toISOString().split('T')[0];
        return !(day === 0 || day === 6 || redDays.includes(dateString));
    }

    function getNextWorkingDay(date) {
        let nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        while (!isWorkingDay(nextDate)) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
        return nextDate;
    }

    function calculateProjectDuration(panelCount, teamSize) {
        return Math.ceil((panelCount / 0.7) / teamSize);
    }

    try {
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const planningsSnapshot = await getDocs(collection(db, 'planning'));
        const plannings = planningsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (const team of teams) {
            const teamPlannings = plannings.filter(p => p.team === team.name);
            let lastEndDate = teamPlannings.length > 0 ? 
                new Date(Math.max(...teamPlannings.map(p => new Date(p.endDate)))) : 
                new Date(); 

            const projectDuration = calculateProjectDuration(panelCount, team.members.length);
            let startDate = getNextWorkingDay(lastEndDate);
            let endDate = startDate;

            for (let i = 0; i < projectDuration; i++) {
                endDate = getNextWorkingDay(endDate);
            }

            const workHoursPerDay = 8; 
            const travelTimeHours = travelTimeMinutes / 60;
            const totalWorkHours = workHoursPerDay - travelTimeHours;

            await addDoc(collection(db, 'planning'), {
                projectId,
                team: team.name,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                employees: team.members
            });

            await autoScheduleElectrician(projectId, endDate);
            break;  
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
    } else {
        console.warn(`Elektrikern är redan bokad för två projekt den dagen: ${projectEndDate}`);
    }
}
