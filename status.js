import { db, collection, getDocs, doc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const newProjects = document.getElementById('new-projects');
    const plannedProjects = document.getElementById('planned-projects');
    const solarCompletedProjects = document.getElementById('solar-completed-projects');
    const electricianCompletedProjects = document.getElementById('electrician-completed-projects');
    const commissionedProjects = document.getElementById('commissioned-projects');
    const billedProjects = document.getElementById('billed-projects');
    const electricianNotSolarProjects = document.getElementById('electrician-not-solar-projects'); // Ny kategori

    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        let projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Projects:', projects);

        // Sortera projekten alfabetiskt efter namn
        projects.sort((a, b) => a.name.localeCompare(b.name, 'sv', { sensitivity: 'base' }));

        projects.forEach(project => {
            console.log(`Project ID: ${project.id}, Status: ${project.status}`);

            const li = document.createElement('li');
            li.id = project.id;
            li.textContent = project.name;
            li.onclick = () => navigateToProjectDetail(project.id);
            li.classList.add('project-item');

            // Normalisera status för att undvika problem med versaler/gemener eller extra mellanslag
            const normalizedStatus = project.status.trim().toLowerCase();

            switch (normalizedStatus) {
                case 'ny':
                    newProjects.appendChild(li);
                    break;
                case 'planerad':
                    plannedProjects.appendChild(li);
                    break;
                case 'solceller klart':
                    solarCompletedProjects.appendChild(li);
                    break;
                case 'elektriker klar':
                    electricianCompletedProjects.appendChild(li);
                    break;
                case 'driftsatt':
                    commissionedProjects.appendChild(li);
                    break;
                case 'fakturerad':
                    billedProjects.appendChild(li);
                    break;
                case 'elektriker klar men inte solceller': // Ny status
                    electricianNotSolarProjects.appendChild(li);
                    break;
                default:
                    console.warn(`Projekt med ID ${project.id} har okänd status: ${project.status}`);
                    break;
            }
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});

function searchProjects() {
    const input = document.getElementById('search-input').value.toLowerCase();
    const projectItems = document.querySelectorAll('.project-item');

    projectItems.forEach(item => {
        if (item.textContent.toLowerCase().includes(input)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function toggleCategory(categoryId) {
    const categoryList = document.getElementById(categoryId);
    if (categoryList.style.display === 'none') {
        categoryList.style.display = 'block';
    } else {
        categoryList.style.display = 'none';
    }
}

// Definiera navigateToProjectDetail för att hantera navigering till projektdetaljer
function navigateToProjectDetail(projectId) {
    window.location.href = `projekt-detalj.html?id=${projectId}`;
}

window.navigateTo = (page) => {
    window.location.href = page;
};

// Lägg till en event listener för tillbaka-knappen
document.getElementById('back-button').addEventListener('click', () => {
    navigateTo('index.html'); // Navigera till startsidan
});
