import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const db = getFirestore();

// Hämtar alla inaktiva användare
async function getInactiveUsers() {
    const querySnapshot = await getDocs(collection(db, "users"));
    const inactiveUsers = [];
    querySnapshot.forEach((doc) => {
        if (!doc.data().active) {
            inactiveUsers.push({ id: doc.id, ...doc.data() });
        }
    });
    return inactiveUsers;
}

// Aktivera en användare
async function activateUser(userId) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { active: true });
    alert('Användaren har aktiverats.');
    window.location.reload();
}

// Visa alla inaktiva användare på sidan
async function renderInactiveUsers() {
    const userList = document.getElementById('user-list');
    const users = await getInactiveUsers();
    
    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
        
        const activateButton = document.createElement('button');
        activateButton.textContent = 'Aktivera';
        activateButton.addEventListener('click', () => activateUser(user.id));
        
        listItem.appendChild(activateButton);
        userList.appendChild(listItem);
    });
}

renderInactiveUsers();
