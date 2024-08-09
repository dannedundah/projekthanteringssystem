import { db, collection, query, where, getDocs } from './firebase-config.js';
import * as XLSX from 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.9/xlsx.full.min.js';

document.addEventListener('DOMContentLoaded', () => {
    const dateRangeForm = document.getElementById('date-range-form');

    dateRangeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        endDate.setHours(23, 59, 59, 999); // Sätt slutdatumets tid till slutet av dagen

        try {
            const q = query(
                collection(db, 'timeReports'),
                where('date', '>=', startDate.toISOString().split('T')[0]),
                where('date', '<=', endDate.toISOString().split('T')[0])
            );
            const querySnapshot = await getDocs(q);

            const timeReports = querySnapshot.docs.map(doc => doc.data());

            if (timeReports.length > 0) {
                const worksheet = XLSX.utils.json_to_sheet(timeReports);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Tidsrapporter');
                XLSX.writeFile(workbook, 'Tidsrapporter.xlsx');
            } else {
                alert('Inga tidsrapporter hittades för det angivna datumintervallet.');
            }
        } catch (error) {
            console.error('Error exporting time reports:', error);
            alert('Ett fel uppstod vid exporten av tidsrapporter.');
        }
    });
});

function navigateTo(page) {
    window.location.href = page;
}
