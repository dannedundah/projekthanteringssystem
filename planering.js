import { db, collection, getDocs, addDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const planningForm = document.getElementById('planning-form');
    const employee1Dropdown = document.getElementById('employee-1');
    const employee2Dropdown = document.getElementById('employee-2');
    const employee3Dropdown = document.getElementById('employee-3');
    const employee4Dropdown = document.getElementById('employee-4');

    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const createOption = (user) => {
            const option = document.createElement('option');
            option.value = `${user.firstName} ${user.lastName}`;
            option.textContent = `${user.firstName} ${user.lastName}`;
            return option;
        };

        users.forEach(user => {
            const option = createOption(user);
            employee1Dropdown.appendChild(option.cloneNode(true));
            employee2Dropdown.appendChild(option.cloneNode(true));
            employee3Dropdown.appendChild(option.cloneNode(true));
            employee4Dropdown.appendChild(option.cloneNode(true));
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }

    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectId = document.getElementById('project-id').value.trim();
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const electricianDate = document.getElementById('electrician-date').value;
        const employees = [
            employee1Dropdown.value,
            employee2Dropdown.value,
            employee3Dropdown.value,
            employee4Dropdown.value,
        ].filter(employee => employee !== '');

        const planning = {
            projectId,
            startDate,
            endDate,
            electricianDate,
            employees,
        };

        try {
            await addDoc(collection(db, 'planning'), planning);
            alert('Planering sparad!');
            planningForm.reset();
        } catch (error) {
            console.error('Error saving planning:', error);
            alert('Ett fel uppstod vid sparandet av planeringen.');
        }
    });

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
