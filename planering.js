import { db, collection, getDocs, addDoc, query, where } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const planningForm = document.getElementById('planning-form');
    const projectDropdown = document.getElementById('project-id');
    const employee1Dropdown = document.getElementById('employee-1');
    const employee2Dropdown = document.getElementById('employee-2');
    const employee3Dropdown = document.getElementById('employee-3');
    const employee4Dropdown = document.getElementById('employee-4');

    if (!projectDropdown || !employee1Dropdown || !employee2Dropdown || !employee3Dropdown || !employee4Dropdown) {
        console.error('One or more dropdown elements are not found.');
        return;
    }

    try {
        // Fetch projects with status "Ny"
        const projectsQuery = query(collection(db, 'projects'), where('status', '==', 'Ny'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectDropdown.appendChild(option);
        });

        // Fetch registered users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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
        console.error('Error fetching data:', error);
    }

    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectId = projectDropdown.value.trim();
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
