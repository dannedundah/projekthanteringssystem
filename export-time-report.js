import { db, collection, query, where, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('date-range-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (startDate && endDate) {
            try {
                const q = query(collection(db, 'timeReports'), where('date', '>=', startDate), where('date', '<=', endDate));
                const querySnapshot = await getDocs(q);

                const timeReports = [];
                querySnapshot.forEach((doc) => {
                    timeReports.push(doc.data());
                });

                if (timeReports.length > 0) {
                    const worksheet = XLSX.utils.json_to_sheet(timeReports);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tidrapporter');
                    XLSX.writeFile(workbook, `Tidrapporter_${startDate}_till_${endDate}.xlsx`);
                } else {
                    alert('Inga tidrapporter hittades inom det valda datumintervallet.');
                }
            } catch (error) {
                console.error('Error exporting time reports:', error);
                alert('Ett fel uppstod vid exporten av tidrapporter.');
            }
        } else {
            alert('Vänligen välj både startdatum och slutdatum.');
        }
    });
});

function navigateTo(page) {
    window.location.href = page;
}
