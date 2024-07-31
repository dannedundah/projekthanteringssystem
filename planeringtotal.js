import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ganttTableBody = document.getElementById('gantt-table-body');

    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        const plannings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter out projects with status "Fakturerad"
        const filteredPlannings = plannings.filter(planning => planning.status !== 'Fakturerad');

        // Sort plannings by start date in ascending order
        filteredPlannings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        ganttTableBody.innerHTML = '';
        filteredPlannings.forEach(planning => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="projekt-detalj.html?id=${planning.projectId}">${planning.address}</a></td>
                <td>${planning.startDate}</td>
                <td>${planning.endDate}</td>
                <td>${planning.electricianDate || 'Ej specificerad'}</td>
                <td>${planning.employees.join(', ')}</td>
            `;
            ganttTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }
});

window.searchProjects = () => {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const rows = document.querySelectorAll('#gantt-table-body tr');

    rows.forEach(row => {
        const projectCell = row.cells[0];
        if (projectCell && projectCell.textContent.toLowerCase().includes(searchInput)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
};

window.navigateTo = (page) => {
    window.location.href = page;
};
