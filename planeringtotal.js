import { db, collection, getDocs, doc, getDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const ganttTableBody = document.getElementById('gantt-table-body');

    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        const planningData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        ganttTableBody.innerHTML = ''; // Clear any existing content

        for (const plan of planningData) {
            const projectRef = doc(db, 'projects', plan.project);
            const projectSnap = await getDoc(projectRef);
            const projectData = projectSnap.exists() ? projectSnap.data() : { address: 'Ej specificerad' };
            const projectAddress = projectData.address || 'Ej specificerad';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${projectAddress}</td>
                <td>${plan.startDate}</td>
                <td>${plan.endDate}</td>
            `;
            ganttTableBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }
});
