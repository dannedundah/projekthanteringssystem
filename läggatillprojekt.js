import { db, collection, addDoc, storage, ref, uploadBytes, getDownloadURL, updateDoc, doc, getDocs, query } from './firebase-config.js';

// Lista över röda dagar (år måste uppdateras varje år eller dynamiskt)
const redDays = [
    '2024-01-01', // Nyårsdagen
    '2024-04-10', // Långfredagen
    '2024-04-13', // Annandag påsk
    '2024-05-01', // Första maj
    '2024-05-21', // Kristi Himmelsfärdsdag
    '2024-06-06', // Nationaldagen
    '2024-12-25', // Juldagen
    '2024-12-26', // Annandag jul
];

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

                const { startDate: availableStartDate, team: selectedTeam } = await getAvailableStartDateForTeam(estimatedDays);

                const planning = {
                    projectId: docRef.id,
                    startDate: availableStartDate,
                    endDate: calculateEndDate(availableStartDate, estimatedDays), // Inkludera alla dagar
                    team: selectedTeam, // Tilldelat team med närmast lediga tid
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

// Funktion för att hitta lediga startdatum för teamet som har närmast lediga tid (Rickard och Reza)
async function getAvailableStartDateForTeam(estimatedDays) {
    const teams = ['Team Rickard', 'Team Reza']; // Team Marcus har tagits bort
    const planningsSnapshot = await getDocs(collection(db, 'planning'));
    const existingPlannings = planningsSnapshot.docs.map(doc => doc.data());

    let availableStartDate = new Date();
    availableStartDate.setHours(0, 0, 0, 0); // Nollställ tid så vi bara jobbar med datum

    // Kontroll för att se till att datumet inte ligger bakåt i tiden
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Sätt dagens datum utan tidskomponent

    // Gå igenom varje dag tills vi hittar en ledig dag för ett av teamen framåt i tiden
    while (availableStartDate >= today) {
        if (isWeekday(availableStartDate) && !isRedDay(availableStartDate)) {
            for (let team of teams) {
                const teamPlannings = existingPlannings.filter(planning => planning.team === team);

                let teamAvailable = true;

                // Kolla om teamet är upptaget någon av de kommande dagarna
                for (let i = 0; i < estimatedDays; i++) {
                    const checkDate = new Date(availableStartDate);
                    checkDate.setDate(checkDate.getDate() + i);

                    // Kontrollera om teamet är upptaget
                    teamAvailable = !teamPlannings.some(planning => {
                        const planningStartDate = new Date(planning.startDate);
                        const planningEndDate = new Date(planning.endDate);
                        return checkDate >= planningStartDate && checkDate <= planningEndDate;
                    });

                    if (!teamAvailable) break; // Om teamet är upptaget, gå vidare till nästa team
                }

                // Om teamet är ledigt, returnera det
                if (teamAvailable) {
                    return { startDate: availableStartDate.toISOString().split('T')[0], team };
                }
            }
        }

        // Om inget team är tillgängligt, gå framåt en dag
        availableStartDate.setDate(availableStartDate.getDate() + 1);
    }

    // Om alla tillgängliga datum är förbi dagens datum, säkerställ att schemaläggningen inte går bakåt i tiden
    if (availableStartDate < today) {
        availableStartDate = today;
    }

    return { startDate: availableStartDate.toISOString().split('T')[0], team: teams[0] }; // Returnera dagens datum eller närmaste framåt
}

// Funktion för att kontrollera om en dag är en vardag (måndag till fredag)
function isWeekday(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5; // 1 = måndag, 5 = fredag
}

// Funktion för att kontrollera om en dag är en röd dag
function isRedDay(date) {
    const formattedDate = date.toISOString().split('T')[0]; // Formatera som YYYY-MM-DD
    return redDays.includes(formattedDate);
}

// Funktion för att hitta lediga datum för elektriker
async function getElectricianAvailableDate(preferredDate) {
    const maxProjectsPerDay = 2; // Max antal projekt per dag för en elektriker
    let availableDate = new Date(preferredDate);

    while (true) {
        // Kontrollera om dagen är en vardag och inte en röd dag
        if (isWeekday(availableDate) && !isRedDay(availableDate)) {
            const dateString = availableDate.toISOString().split('T')[0];
            const planningsSnapshot = await getDocs(collection(db, 'planning'));
            const electricianPlannings = planningsSnapshot.docs
                .map(doc => doc.data())
                .filter(planning => planning.electricianStartDate === dateString);

            // Om färre än max antal projekt är schemalagda, returnera datumet
            if (electricianPlannings.length < maxProjectsPerDay) {
                return dateString;
            }
        }

        // Om elektrikern inte är tillgänglig eller det är en röd dag, gå framåt en dag
        availableDate.setDate(availableDate.getDate() + 1);
    }
}

// Funktion för att beräkna slutdatum för projektet baserat på startdatum och uppskattade dagar
function calculateEndDate(startDate, estimatedDays) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + estimatedDays - 1); // Ta med hela sista dagen
    return endDate.toISOString().split('T')[0];
}

// Funktion för att planera elektrikerns startdatum
function calculateElectricianDate(startDate, estimatedDays) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + estimatedDays - 1);
    return endDate.toISOString().split('T')[0];
}
