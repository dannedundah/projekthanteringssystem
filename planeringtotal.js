import { auth, onAuthStateChanged, signOut } from './firebase-config.js';
import { db, collection, getDocs, getDoc, doc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Kontrollera om användaren är aktiv
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().active) {
                // Användaren är inloggad och aktiv
                initializePage();
            } else {
                // Användaren är inloggad men inte aktiv
                await signOut(auth);
                alert('Din användare är inte aktiv. Kontakta administratören.');
                window.location.href = 'login.html';
            }
        } else {
            // Användaren är inte inloggad
            window.location.href = 'login.html';
        }
    });

    async function initializePage() {
        const ganttTableBody = document.getElementById('gantt-table-body');
        const searchInput = document.getElementById('search-input');

        if (!ganttTableBody) {
            console.error("Element with ID 'gantt-table-body' not found.");
            return;
        }

        let plannings = [];
        try {
            const querySnapshot = await getDocs(collection(db, 'planning'));
            plannings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filtrera bort projekt med specifik status och specifikt projekt-ID
            plannings = plannings.filter(planning => planning.projectId !== 'moBgPPK2jgyZaeBnqza1' && planning.status !== 'Fakturerad' && planning.status !== 'elektriker klar');

            renderGanttChart(plannings); // Render initial chart
        } catch (error) {
            console.error('Error fetching plannings:', error);
        }

        // Event listener för sökinput
        searchInput.addEventListener('input', async () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const filteredPlannings = [];

            for (const planning of plannings) {
                try {
                    const projectDocRef = doc(db, 'projects', planning.projectId);
                    const projectDoc = await getDoc(projectDocRef);
                    if (projectDoc.exists()) {
                        const projectData = projectDoc.data();
                        if (projectData.address && projectData.address.toLowerCase().includes(searchTerm)) {
                            filteredPlannings.push(planning);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching project details:', error);
                }
            }

            renderGanttChart(filteredPlannings); // Re-render chart with filtered data
        });

        async function renderGanttChart(plannings) {
            ganttTableBody.innerHTML = ''; // Rensa befintligt innehåll

            // Sortera plannings efter startdatum i stigande ordning
            plannings.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            for (const planning of plannings) {
                try {
                    const projectDocRef = doc(db, 'projects', planning.projectId);
                    const projectDoc = await getDoc(projectDocRef);
                    if (projectDoc.exists()) {
                        const projectData = projectDoc.data();
                        const address = projectData.address || 'Ej specificerad';
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><a href="projekt-detalj.html?id=${planning.projectId}">${address}</a></td>
                            <td>${planning.startDate}</td>
                            <td>${planning.endDate}</td>
                            <td>${planning.electricianDate || 'Ej specificerad'}</td>
                            <td>${planning.employees.join(', ')}</td>
                        `;
                        ganttTableBody.appendChild(row);
                    }
                } catch (error) {
                    console.error('Error fetching project details:', error);
                }
            }
        }
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
