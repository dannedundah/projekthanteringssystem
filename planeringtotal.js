import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ganttTableBody = document.getElementById('gantt-table-body');

    if (!ganttTableBody) {
        console.error("Element with ID 'gantt-table-body' not found.");
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        const plannings = querySnapshot.docs.map(doc => doc.data());

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
                    <td>${project.address}</td>
                    <td>${planning.startDate}</td>
                    <td>${planning.endDate}</td>
                    <td>${planning.electricianDate || 'Ej specificerad'}</td>
                    <td>${planning.employees.join(', ')}</td>
                `;
                ganttTableBody.appendChild(row);
            }
        }
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }
});
