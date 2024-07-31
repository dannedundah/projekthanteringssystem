import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ganttTableBody = document.getElementById('gantt-table-body');
    const searchInput = document.getElementById('search-input');

    if (!ganttTableBody) {
        console.error("Element with ID 'gantt-table-body' not found.");
        return;
    }

    let plannings = [];
    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        plannings = querySnapshot.docs.map(doc => doc.data());

        renderGanttChart(plannings); // Render initial chart
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }

    // Event listener for search input
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filteredPlannings = plannings.filter(planning => {
            // Fetch project details
            const projectRef = getDocs(collection(db, 'projects'));
            const projectData = projectRef.docs.find(proj => proj.id === planning.project);
            const project = projectData ? projectData.data() : null;

            return project && project.address.toLowerCase().includes(searchTerm);
        });

        renderGanttChart(filteredPlannings); // Re-render chart with filtered data
    });

    function renderGanttChart(plannings) {
        ganttTableBody.innerHTML = ''; // Clear existing content

        // Sort plannings by startDate in ascending order
        plannings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        for (const planning of plannings) {
            // Fetch project details
            const projectRef = await getDocs(collection(db, 'projects'));
            const projectData = projectRef.docs.find(proj => proj.id === planning.project);
            const project = projectData ? projectData.data() : null;

            if (project && planning.status !== 'Fakturerad') {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><a href="projekt-detalj.html?id=${planning.project}">${project.address || 'Ej specificerad'}</a></td>
                    <td>${planning.startDate}</td>
                    <td>${planning.endDate}</td>
                    <td>${planning.electricianDate || 'Ej specificerad'}</td>
                    <td>${planning.employees.join(', ')}</td>
                `;
                ganttTableBody.appendChild(row);
            }
        }
    }
});
