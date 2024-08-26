import { db, collection, getDocs, doc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const rolesTableBody = document.getElementById('roles-table').querySelector('tbody');

    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach(doc => {
            const userData = doc.data();
            addUserRow(doc.id, userData);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }

    function addUserRow(uid, userData) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${userData.name}</td>
            <td>${userData.email}</td>
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
