import { db, collection, addDoc, getDocs, deleteDoc, doc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const teamList = document.getElementById('teams');
    const createTeamBtn = document.getElementById('create-team-btn');

    // Ladda befintliga team vid sidladdning
    loadTeams();

    createTeamBtn.addEventListener('click', async () => {
        const newTeamName = document.getElementById('new-team-name').value.trim();
        if (newTeamName) {
            try {
                await addDoc(collection(db, 'teams'), { name: newTeamName });
                document.getElementById('new-team-name').value = '';
                loadTeams(); // Ladda om teamlistan
                alert('Nytt team skapat!');
            } catch (error) {
                console.error('Error creating team:', error);
                alert('Ett fel uppstod vid skapandet av teamet.');
            }
        } else {
            alert('Ange ett teamnamn.');
        }
    });

    async function loadTeams() {
        try {
            teamList.innerHTML = '';
            const querySnapshot = await getDocs(collection(db, 'teams'));
            querySnapshot.forEach((doc) => {
                const li = document.createElement('li');
                li.textContent = doc.data().name;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Ta bort';
                deleteButton.classList.add('remove-button');
                deleteButton.onclick = async () => await deleteTeam(doc.id);
                li.appendChild(deleteButton);
                teamList.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading teams:', error);
        }
    }

    async function deleteTeam(teamId) {
        if (confirm('Är du säker på att du vill ta bort detta team?')) {
            try {
                await deleteDoc(doc(db, 'teams', teamId));
                loadTeams(); // Ladda om teamlistan
                alert('Teamet har tagits bort!');
            } catch (error) {
                console.error('Error deleting team:', error);
                alert('Ett fel uppstod vid borttagning av teamet.');
            }
        }
    }
});
