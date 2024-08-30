import { db, collection, query, where, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const statusBtn = document.getElementById('status-btn');
    const statusReportDiv = document.getElementById('status-report');
    const statusReportBody = document.getElementById('status-report-body');

    exportBtn.addEventListener('click', async () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (startDate && endDate) {
            try {
                const q = query(
                    collection(db, 'timeReports'),
                    where('date', '>=', startDate),
                    where('date', '<=', endDate)
                );

                const querySnapshot = await getDocs(q);
                const reports = querySnapshot.docs.map(doc => doc.data());

                if (reports.length > 0) {
                    const projectDetails = await fetchProjectDetails(reports);

                    // Gruppera rapporterna efter anställd
                    const groupedReports = groupReportsByEmployee(reports, projectDetails);

                    // Skapa arbetsboken
                    const workbook = XLSX.utils.book_new();

                    // Lägg till ett kalkylblad per anställd
                    for (const employee in groupedReports) {
                        const sheetData = generateSheetData(groupedReports[employee]);
                        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
                        XLSX.utils.book_append_sheet(workbook, worksheet, employee);
                    }

                    // Exportera arbetsboken till Excel
                    XLSX.writeFile(workbook, `Tidsrapport_${startDate}_till_${endDate}.xlsx`);
                } else {
                    alert('Inga tidsrapporter hittades för det valda datumintervallet.');
                }
            } catch (error) {
                console.error('Error exporting time reports:', error);
                alert('Ett fel uppstod vid export av tidsrapporter.');
            }
        } else {
            alert('Vänligen välj både start- och slutdatum.');
        }
    });

    statusBtn.addEventListener('click', async () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (startDate && endDate) {
            try {
                // Hämta alla anställda
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Hämta rapporter inom datumintervallet
                const q = query(
                    collection(db, 'timeReports'),
                    where('date', '>=', startDate),
                    where('date', '<=', endDate)
                );
                const querySnapshot = await getDocs(q);
                const reports = querySnapshot.docs.map(doc => doc.data());

                // Beräkna alla arbetsdagar inom intervallet
                const workDays = calculateWorkDays(new Date(startDate), new Date(endDate));

                // Gruppera rapporterna efter anställd och kontrollera om alla arbetsdagar är rapporterade
                const reportStatus = {};
                users.forEach(user => {
                    const employeeReports = reports.filter(report => report.employee === `${user.firstName} ${user.lastName}`);
                    const reportedDates = employeeReports.map(report => report.date);

                    // Kontrollera om medarbetaren har rapporterat alla arbetsdagar
                    const allDaysReported = workDays.every(day => reportedDates.includes(day));
                    reportStatus[`${user.firstName} ${user.lastName}`] = allDaysReported ? 'Ja' : 'Nej';
                });

                // Visa status i tabellen
                statusReportBody.innerHTML = '';
                for (const employee in reportStatus) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${employee}</td><td>${reportStatus[employee]}</td>`;
                    statusReportBody.appendChild(row);
                }

                statusReportDiv.style.display = 'block';
            } catch (error) {
                console.error('Error loading status report:', error);
                alert('Ett fel uppstod vid laddning av statusrapporten.');
            }
        } else {
            alert('Vänligen välj både start- och slutdatum.');
        }
    });
});

async function fetchProjectDetails(reports) {
    const projectIds = [...new Set(reports.map(report => report.projectId))];
    const projectDetails = {};

    for (const projectId of projectIds) {
        const projectQuery = query(collection(db, 'projects'), where('__name__', '==', projectId));
        const projectSnapshot = await getDocs(projectQuery);
        if (projectSnapshot.docs.length > 0) {
            projectDetails[projectId] = projectSnapshot.docs[0].data().address || 'Ej specificerad';
        } else {
            projectDetails[projectId] = 'Ej specificerad';
        }
    }

    return projectDetails;
}

function groupReportsByEmployee(reports, projectDetails) {
    const grouped = {};

    reports.forEach(report => {
        const employee = report.employee;
        const projectAddress = projectDetails[report.projectId] || 'Ej specificerad';

        if (!grouped[employee]) {
            grouped[employee] = [];
        }

        grouped[employee].push({
            date: report.date,
            projectAddress,
            timeType: report.timeType,
            hours: report.hours,
            comment: report.comment || '' // Lägg till kommentaren här
        });
    });

    return grouped;
}

function generateSheetData(reports) {
    const sheetData = [['Datum', 'Projekt', 'Typ av tid', 'Antal timmar', 'Kommentar']]; // Uppdatera rubrikerna
    const timeSummary = {};

    reports.forEach(report => {
        sheetData.push([report.date, report.projectAddress, report.timeType, report.hours, report.comment]); // Inkludera kommentar

        if (!timeSummary[report.timeType]) {
            timeSummary[report.timeType] = 0;
        }

        timeSummary[report.timeType] += report.hours;
    });

    // Lägg till en tom rad och sedan summering av timmar per typ
    sheetData.push([]);
    sheetData.push(['Summering']);
    for (const timeType in timeSummary) {
        sheetData.push([timeType, '', '', timeSummary[timeType]]);
    }

    return sheetData;
}

function calculateWorkDays(start, end) {
    const workDays = [];
    let currentDate = new Date(start);

    // Lista över röda dagar (anpassa efter lokala helgdagar)
    const holidays = [
        '2024-01-01', // Nyårsdagen
        '2024-01-06', // Trettondagen
        // Lägg till fler helgdagar här...
    ];

    while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        const formattedDate = currentDate.toISOString().split('T')[0];

        // Kontrollera om det är en vardag (måndag till fredag) och inte en helgdag
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(formattedDate)) {
            workDays.push(formattedDate);
        }

        // Gå vidare till nästa dag
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return workDays;
}

window.navigateTo = (page) => {
    window.location.href = page;
};
