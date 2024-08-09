import { db, collection, query, where, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const exportForm = document.getElementById('export-time-report-form');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const exportButton = document.getElementById('export-time-report-btn');

    exportButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert('Vänligen fyll i båda datumen.');
            return;
        }

        try {
            // Hämta tidrapporter från Firestore baserat på datumintervall
            const q = query(collection(db, 'timeReports'), where('date', '>=', startDate), where('date', '<=', endDate));
            const querySnapshot = await getDocs(q);
            const timeReports = querySnapshot.docs.map(doc => doc.data());

            if (timeReports.length === 0) {
                alert('Inga tidrapporter hittades för det angivna datumintervallet.');
                return;
            }

            // Konvertera tidrapporterna till ett Excel-format
            const ws = XLSX.utils.json_to_sheet(timeReports);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Time Reports');

            // Exportera arbetsboken till en fil
            XLSX.writeFile(wb, `time_reports_${startDate}_till_${endDate}.xlsx`);

            alert('Tidrapporter har exporterats till Excel!');
        } catch (error) {
            console.error('Error exporting time reports:', error);
            alert('Ett fel uppstod vid exporteringen.');
        }
    });
});

function navigateTo(page) {
    window.location.href = page;
}
