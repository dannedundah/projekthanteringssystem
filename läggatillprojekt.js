import { db, collection, addDoc, storage, ref, uploadBytes, getDownloadURL, updateDoc, doc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('project-form');
    const projectDescription = document.getElementById('project-description');

    // Sätt standardtexten i projektbeskrivningen när sidan laddas
    const defaultDescription = `
Paneler:
Växelriktare:
Batteri:
Laddbox:
Innertak:
Mätarplacering:
Storlek på huvudsäkring:
Nätbolag:
    `;
    projectDescription.value = defaultDescription.trim();

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectName = document.getElementById('project-input').value.trim();
        const customerName = document.getElementById('customer-name').value.trim();
        const customerPhone = document.getElementById('customer-phone').value.trim();
        const customerEmail = document.getElementById('customer-email').value.trim();
        const projectAddress = document.getElementById('project-address').value.trim();
        const projectDescriptionValue = document.getElementById('project-description').value.trim();
        const panelCount = document.getElementById('panel-count').value.trim(); // Hämta antal paneler
        const projectFiles = document.getElementById('project-files').files;

        const imageUrls = [];
        const fileUrls = [];

        try {
            // Ladda upp filer till Firebase Storage
            for (const file of projectFiles) {
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
                const fileType = file.type.startsWith('image/') ? 'project_images' : 'project_files';
                const storageRef = ref(storage, `${fileType}/${uniqueFileName}`);
                const snapshot = await uploadBytes(storageRef, file);
                const fileUrl = await getDownloadURL(snapshot.ref);

                if (fileType === 'project_images') {
                    imageUrls.push({ name: file.name, url: fileUrl });
                } else {
                    fileUrls.push({ name: file.name, url: fileUrl });
                }
            }

            // Skapa projekt
            const project = {
                name: projectName,
                customerName,
                customerPhone,
                customerEmail,
                address: projectAddress,
                description: projectDescriptionValue,
                status: 'Planerad',  // Projektet blir direkt "Planerad"
                images: imageUrls, // Array med objekt som innehåller bildens namn och URL
                files: fileUrls,   // Array med objekt som innehåller filens namn och URL
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'projects'), project);

            // Automatisk schemaläggning baserat på antal paneler
            if (panelCount) {
                const estimatedDays = Math.ceil(panelCount / 0.7 / 16);

                const availableStartDate = await getAvailableStartDateForTeam(estimatedDays);

                const planning = {
                    projectId: docRef.id,
                    startDate: availableStartDate,
                    endDate: calculateEndDate(availableStartDate, estimatedDays),
                    team: 'Team Marcus', // Justera team här
                    employees: ['Employee1', 'Employee2'], // Justera anställda här
                };

                // Planera in elektriker
                const electricianDate = calculateElectricianDate(availableStartDate, estimatedDays);
                const electricianAvailableDate = await getElectricianAvailableDate(electricianDate);

                if (electricianAvailableDate) {
                    planning.electricianStartDate = electricianAvailableDate;
                    planning.electricianEndDate = electricianAvailableDate;
                }

                // Spara schemaläggningen
                await addDoc(collection(db, 'planning'), planning);

                // Uppdatera projektstatus
                await updateDoc(doc(db, 'projects', docRef.id), {
                    status: 'Planerad'
                });
            }

            alert('Projektet har lagts till och schemalagts automatiskt!');
            window.location.href = 'status.html';
        } catch (error) {
            console.error('Error adding project:', error);
            alert('Ett fel uppstod vid tillägg av projekt.');
        }
    });
});

// Funktionsdefinitioner

// Funktion för att hitta lediga startdatum för teamet baserat på antal dagar
async function getAvailableStartDateForTeam(estimatedDays) {
    const teams = ['Team Marcus', 'Team Rickard', 'Team Reza'];
    const planningsSnapshot = await getDocs(collection(db, 'planning'));
    const existingPlannings = planningsSnapshot.docs.map(doc => doc.data());

    let availableStartDate = new Date(); 
    while (!isTeamAvailableOnDate(availableStartDate, teams, estimatedDays, existingPlannings)) {
        availableStartDate.setDate(availableStartDate.getDate() + 1); 
    }

    return availableStartDate.toISOString().split('T')[0];
}

// Funktion för att kontrollera om teamet är tillgängligt under en viss period
function isTeamAvailableOnDate(startDate, teams, estimatedDays, existingPlannings) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + estimatedDays);

    return teams.every(team => {
        const teamPlannings = existingPlannings.filter(planning => planning.team === team);
        return !teamPlannings.some(planning => {
            const planningStartDate = new Date(planning.startDate);
            const planningEndDate = new Date(planning.endDate);
            return (startDate <= planningEndDate && endDate >= planningStartDate);
        });
    });
}

// Funktion för att hitta lediga datum för elektriker
async function getElectricianAvailableDate(preferredDate) {
    const maxProjectsPerDay = 2;
    let availableDate = new Date(preferredDate);

    while (!(await isElectricianAvailableOnDate(availableDate, maxProjectsPerDay))) {
        availableDate.setDate(availableDate.getDate() + 1); 
    }

    return availableDate.toISOString().split('T')[0];
}

// Funktion för att kontrollera om elektriker är tillgänglig på ett visst datum
async function isElectricianAvailableOnDate(date, maxProjectsPerDay) {
    const dateString = date.toISOString().split('T')[0];
    const planningsSnapshot = await getDocs(collection(db, 'planning'));
    const electricianPlannings = planningsSnapshot.docs
        .map(doc => doc.data())
        .filter(planning => planning.electricianStartDate === dateString);

    return electricianPlannings.length < maxProjectsPerDay;
}

// Funktion för att beräkna slutdatum för projektet baserat på startdatum och uppskattade dagar
function calculateEndDate(startDate, estimatedDays) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + estimatedDays - 1);
    return endDate.toISOString().split('T')[0];
}

// Funktion för att planera elektrikerns startdatum
function calculateElectricianDate(startDate, estimatedDays) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + estimatedDays - 1); 
    return endDate.toISOString().split('T')[0];
}
