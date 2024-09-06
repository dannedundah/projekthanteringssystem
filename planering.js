import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from './firebase-config.js';

export async function autoScheduleProject(projectId, panelCount) {
    const validTeams = ["Team Marcus", "Team Rickard", "Team Mustafa"];  // Endast dessa team ska schemaläggas automatiskt

    try {
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        const teams = teamsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(team => validTeams.includes(team.name));  // Filtrera endast de relevanta teamen

        const planningsSnapshot = await getDocs(collection(db, 'planning'));
        const plannings = planningsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let earliestStartDate = null;
        let selectedTeam = null;

        for (const team of teams) {
            const teamPlannings = plannings.filter(p => p.team === team.name);
            
            // Hitta det senaste slutdatumet för teamet eller sätt dagens datum om det är tomt
            let lastEndDate = teamPlannings.length > 0 ? 
                new Date(Math.max(...teamPlannings.map(p => new Date(p.endDate)))) : 
                new Date(); 

            let startDate = getNextWorkingDay(lastEndDate);  // Hitta nästa arbetsdag efter det senaste slutdatumet
            
            // Om det är första teamet eller om detta team har ett tidigare ledigt datum
            if (!earliestStartDate || startDate < earliestStartDate) {
                earliestStartDate = startDate;
                selectedTeam = team;
            }
        }

        if (selectedTeam && earliestStartDate) {
            const projectDuration = calculateProjectDuration(panelCount);
            let endDate = earliestStartDate;

            for (let i = 0; i < projectDuration; i++) {
                endDate = getNextWorkingDay(endDate);  // Beräkna slutdatum baserat på arbetsdagar
            }

            // Lägg till schemat för projektet
            await addDoc(collection(db, 'planning'), {
                projectId,
                team: selectedTeam.name,
                startDate: earliestStartDate.toISOString().split('T')[0],  // Närmsta lediga arbetsdag
                endDate: endDate.toISOString().split('T')[0],
                employees: selectedTeam.members
            });

            // Ändra projektets status till "Planerad"
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                status: 'Planerad'
            });

            // Schemalägg elektriker dagen efter slutdatum
            await autoScheduleElectrician(projectId, endDate);
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
    
    // Kontrollera om elektrikern redan har två projekt den dagen
    electricianBookings = electricianPlannings.filter(p => {
        const startDate = new Date(p.electricianStartDate);
        return startDate.toISOString().split('T')[0] === projectEndDate.toISOString().split('T')[0];
    });

    if (electricianBookings.length < 2) {
        const electricianStartDate = getNextWorkingDay(projectEndDate);  // Elektrikern börjar nästa arbetsdag efter att projektet slutar
        const electricianEndDate = getNextWorkingDay(electricianStartDate);  // Elektrikern jobbar en dag

        // Lägg till elektrikerns schema
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

// Formel för beräkning av arbetsdagar
function calculateProjectDuration(panelCount) {
    return Math.ceil((panelCount / 0.7) / 16);  // Formeln: Antal paneler / 0,7 / 16, avrundat till närmaste heltal
}

// Funktion för att hitta nästa arbetsdag, exkluderar helger
function getNextWorkingDay(date) {
    let nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Exkludera helger, du kan också lägga till logik för röda dagar här om nödvändigt
    while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
        nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate;
}

// Funktion för att manuellt uppdatera datum
export async function updateProjectDates(projectId, startDate, endDate) {
    try {
        const planningRef = doc(db, 'planning', projectId);
        await updateDoc(planningRef, {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });

        console.log(`Projektets datum har uppdaterats: Start ${startDate}, Slut ${endDate}`);
    } catch (error) {
        console.error('Error updating project dates:', error);
    }
}

// Funktion för att ta bort ett projekt
export async function deleteProject(projectId) {
    try {
        const planningRef = doc(db, 'planning', projectId);
        await deleteDoc(planningRef);
        console.log(`Projektet har tagits bort: ${projectId}`);
    } catch (error) {
        console.error('Error deleting project:', error);
    }
}
