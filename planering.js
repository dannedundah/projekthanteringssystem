import { db, collection, addDoc, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const planningForm = document.getElementById('planning-form');
    const employeeName1 = document.getElementById('employee-name-1');
    const employeeName2 = document.getElementById('employee-name-2');
    const employeeName3 = document.getElementById('employee-name-3');
    const projectSelect = document.getElementById('project-select');
    const planningList = document.getElementById('planning-list');

    const employees = ["Marcus", "Noah", "Hampus", "Loa", "Alireza", "Reza", "Andreas", "Rickard", "Mustafa"];
    
    employees.sort().forEach(name => {
        const option1 = document.createElement('option');
        option1.value = name;
        option1.textContent = name;
        employeeName1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = name;
        option2.textContent = name;
        employeeName2.appendChild(option2);

        const option3 = document.createElement('option');
        option3.value = name;
        option3.textContent = name;
        employeeName3.appendChild(option3);
    });

    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        querySnapshot.forEach(doc => {
            const project = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }

    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employee1 = employeeName1.value;
        const employee2 = employeeName2.value;
        const employee3 = employeeName3.value;
        const project = projectSelect.value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        try {
            await addDoc(collection(db, 'planning'), {
                employees: [employee1, employee2, employee3].filter(Boolean),
                projectId: project,
                startDate: startDate,
                endDate: endDate
            });
            alert('Planering tillagd!');
            loadPlanning();
        } catch (error) {
            console.error('Error adding planning:', error);
            alert('Ett fel uppstod vid tillägg av planering.');
        }
    });

    async function loadPlanning() {
        try {
            const querySnapshot = await getDocs(collection(db, 'planning'));
            planningList.innerHTML = '';
            querySnapshot.forEach(doc => {
                const planning = doc.data();
                const div = document.createElement('div');
                div.textContent = `Projekt: ${planning.projectId}, Anställda: ${planning.employees.join(', ')}, Start: ${planning.startDate}, Slut: ${planning.endDate}`;
                planningList.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching planning:', error);
        }
    }

    loadPlanning();
});
