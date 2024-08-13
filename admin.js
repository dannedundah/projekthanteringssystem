import { db, collection, getDocs, updateDoc, doc, auth, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('user-list');

    onAuthStateChanged(auth, async (user) => {
        if (user && user.email === 'daniel@delidel.se') {
            const usersSnapshot = await getDocs(collection(db, 'users'));

            usersSnapshot.forEach((doc) => {
                const userData = doc.data();
                const userItem = document.createElement('div');
                userItem.className = 'user-item';

                userItem.innerHTML = `
                    <p><strong>Namn:</strong> ${userData.firstName} ${userData.lastName}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Status:</strong> ${userData.active ? 'Aktiv' : 'Inaktiv'}</p>
                    <button onclick="toggleUserStatus('${doc.id}', ${userData.active})">
                        ${userData.active ? 'Inaktivera' : 'Aktivera'}
                    </button>
                    <hr>
                `;

                userList.appendChild(userItem);
            });
        } else {
            alert('Du har inte behörighet att se denna sida.');
            window.location.href = 'login.html';
        }
    });
});

window.toggleUserStatus = async (userId, currentStatus) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { active: !currentStatus });
    window.location.reload(); // Uppdatera sidan för att visa ändringar
};

window.navigateTo = (page) => {
    window.location.href = page;
};
