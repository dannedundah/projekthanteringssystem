import { db, collection, query, where, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const dateRangeForm = document.getElementById('date-range-form');

    if (dateRangeForm) {
        dateRangeForm.addEventListener('submit', async (e) => {
            e.preventDefault();

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
    }
});

async function fetchProjectDetails(reports) {
    const projectIds = [...new Set(reports.map(report => report.projectId))];
    const projectDetails = {};

    for (const projectId of projectIds) {
        const projectDoc = await getDocs(collection(db, 'projects'), where('__name__', '==', projectId));
        if (projectDoc.docs.length > 0) {
            projectDetails[projectId] = projectDoc.docs[0].data().address || 'Ej specificerad';
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
        });
    });

    return grouped;
}

function generateSheetData(reports) {
    const sheetData = [['Datum', 'Projekt', 'Typ av tid', 'Antal timmar']];
    const timeSummary = {};

    reports.forEach(report => {
        sheetData.push([report.date, report.projectAddress, report.timeType, report.hours]);

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

window.navigateTo = (page) => {
    window.location.href = page;
};
