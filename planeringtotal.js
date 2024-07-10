import { db, collection, getDocs, doc, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ganttTableBody = document.getElementById('gantt-table-body');

    if (!ganttTableBody) {
        console.error('Element with ID gantt-table-body not found.');
        return;
    }

    let planningData = [];

    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        planningData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        ganttTableBody.innerHTML = ''; // Clear any existing content

        for (const plan of planningData) {
            const projectRef = doc(db, 'projects', plan.project);
            const projectSnap = await getDoc(projectRef);
            const projectData = projectSnap.exists() ? projectSnap.data() : { address: 'Ej specificerad' };
            const projectAddress = projectData.address || 'Ej specificerad';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="projekt-detalj.html?id=${plan.project}">${projectAddress}</a></td>
                <td>${plan.startDate}</td>
                <td>${plan.endDate}</td>
            `;
            ganttTableBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }

    window.searchProjects = () => {
        const input = document.getElementById('search-input').value.toLowerCase();
        const filteredPlanningData = planningData.filter(plan => plan.address.toLowerCase().includes(input));
        ganttTableBody.innerHTML = '';

        filteredPlanningData.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="projekt-detalj.html?id=${plan.project}">${plan.address}</td>
                <td>${plan.startDate}</td>
                <td>${plan.endDate}</td>
            `;
            ganttTableBody.appendChild(row);
        });
    };

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
