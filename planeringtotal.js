import { db, collection, getDocs, doc, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ganttTableBody = document.getElementById('gantt-table-body');

    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        const plannings = await Promise.all(querySnapshot.docs.map(async planningDoc => {
            const planningData = planningDoc.data();
            const projectDoc = await getDoc(doc(db, 'projects', planningData.project));
            return { ...planningData, projectAddress: projectDoc.exists() ? projectDoc.data().address : 'Ej specificerad' };
        }));

        // Sort plannings by start date in ascending order
        plannings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        ganttTableBody.innerHTML = '';
        plannings.forEach(planning => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="projekt-detalj.html?id=${planning.project}">${planning.projectAddress}</a></td>
                <td>${planning.startDate}</td>
                <td>${planning.endDate}</td>
                <td>${planning.electricianDate || 'Ej specificerad'}</td>
            `;
            ganttTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }
});

function searchProjects() {
    const input = document.getElementById('search-input').value.toLowerCase();
    const rows = document.querySelectorAll('#gantt-table-body tr');

    rows.forEach(row => {
        const projectText = row.textContent.toLowerCase();
        row.style.display = projectText.includes(input) ? '' : 'none';
    });
}

window.searchProjects = searchProjects;

function navigateTo(page) {
    window.location.href = page;
}
