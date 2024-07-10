import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const planningList = document.getElementById('planning-list');

    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        const planningData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        planningList.innerHTML = ''; // Clear any existing content
        planningData.forEach(async (plan) => {
            const projectRef = doc(db, 'projects', plan.project);
            const projectSnap = await getDoc(projectRef);
            const projectData = projectSnap.exists() ? projectSnap.data() : { address: 'Ej specificerad' };
            const projectAddress = projectData.address || 'Ej specificerad';
            
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>Adress:</strong> ${projectAddress} <br>
                <strong>Startdatum:</strong> ${plan.startDate} <br>
                <strong>Slutdatum:</strong> ${plan.endDate} <br>
            `;
            planningList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }
});
