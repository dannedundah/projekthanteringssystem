import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const planningList = document.getElementById('planning-list');

    try {
        const querySnapshot = await getDocs(collection(db, 'planning'));
        const plannings = querySnapshot.docs.map(doc => doc.data());
        
        planningList.innerHTML = '';
        plannings.forEach(planning => {
            const div = document.createElement('div');
            div.classList.add('planning-item');
            div.innerHTML = `
                <p><strong>Adress:</strong> ${planning.projectAddress}</p>
                <p><strong>Startdatum:</strong> ${planning.startDate}</p>
                <p><strong>Slutdatum:</strong> ${planning.endDate}</p>
            `;
            planningList.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching plannings:', error);
    }
});

function navigateTo(page) {
    window.location.href = page;
}
