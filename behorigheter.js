import { db, collection, getDocs, doc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const rolesTableBody = document.getElementById('roles-table').querySelector('tbody');

    try {
        // Hämta alla användare från Firestore
        const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach(doc => {
            const userData = doc.data();
            addUserRow(doc.id, userData);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }

    function addUserRow(uid, userData) {
        // Kombinera förnamn och efternamn för att visa korrekt namn
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fullName}</td>
            <td>${userData.email || 'Ingen e-post'}</td>
            <td>
                <select data-uid="${uid}" class="role-select">
                    <option value="Admin" ${userData.role === 'Admin' ? 'selected' : ''}>Admin</option>
                    <option value="Montör" ${userData.role === 'Montör' ? 'selected' : ''}>Montör</option>
                    <option value="Säljare" ${userData.role === 'Säljare' ? 'selected' : ''}>Säljare</option>
                    <option value="Service" ${userData.role === 'Service' ? 'selected' : ''}>Service</option>
                </select>
            </td>
            <td><button class="update-role-btn" data-uid="${uid}">Uppdatera</button></td>
        `;
        rolesTableBody.appendChild(row);
    }

    // Event listener för att uppdatera rollen
    rolesTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('update-role-btn')) {
            const uid = e.target.getAttribute('data-uid');
            const selectElement = document.querySelector(`select[data-uid="${uid}"]`);
            const newRole = selectElement.value;

            try {
                const userRef = doc(db, 'users', uid);
                await updateDoc(userRef, { role: newRole });
                alert('Behörighet uppdaterad!');
            } catch (error) {
                console.error('Error updating role:', error);
                alert('Kunde inte uppdatera behörigheten.');
            }
        }
    });
});
