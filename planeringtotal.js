import { db, collection, getDocs, doc, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ganttTableBody = document.getElementById('gantt-table-body');

    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        let plannings = querySnapshot.docs.map(doc => doc.data());

        // Sort plannings by start date in ascending order
        plannings = plannings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        ganttTableBody.innerHTML = '';
        for (const planning of plannings) {
            const projectDoc = await getDoc(doc(db, 'projects', planning.project));
            const projectData = projectDoc.data();

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="projekt-detalj.html?id=${planning.project}">${projectData.address}</a></td>
                <td>${planning.startDate}</td>
                <td>${planning.endDate}</td>
                <td>${planning.electricianDate || 'Ej specificerad'}</td>
                <td>${planning.employees.filter(Boolean).join(', ') || 'Ej specificerad'}</td>
            `;
            ganttTableBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }
});

function searchProjects() {
    const input = document.getElementById('search-input').value.toLowerCase();
    const rows = document.querySelectorAll('#gantt-table-body tr');

    rows.forEach(row => {
        const projectCell = row.querySelector('td');
        if (projectCell && projectCell.textContent.toLowerCase().includes(input)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

window.searchProjects = searchProjects;
window.navigateTo = (page) => {
    window.location.href = page;
};
