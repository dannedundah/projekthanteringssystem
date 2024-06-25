document.addEventListener('DOMContentLoaded', () => {
    const projectDetails = document.getElementById('project-details');
    const params = new URLSearchParams(window.location.search);
    const projectName = params.get('name');
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];

    const project = projects.find(p => p.name === projectName);
    const projectSchedules = schedules.filter(s => s.project === projectName);

    if (project) {
        projectDetails.innerHTML = `
            <h2>${project.name}</h2>
            <p><strong>Kundnamn:</strong> ${project.customerName}</p>
            <p><strong>Telefonnummer:</strong> ${project.customerPhone}</p>
            <p><strong>Adress:</strong> ${project.address}</p>
            <p><strong>Beskrivning:</strong> ${project.description}</p>
            <p><strong>Status:</strong> ${project.status}</p>
            <p><strong>Startdatum:</strong> ${projectSchedules.length ? projectSchedules[0].startDate : 'Ej tillgängligt'}</p>
            <p><strong>Slutdatum:</strong> ${projectSchedules.length ? projectSchedules[0].endDate : 'Ej tillgängligt'}</p>
            <h3>Anställda</h3>
            <ul>
                ${projectSchedules.map(s => `<li>${s.name}</li>`).join('')}
            </ul>
        `;
    } else {
        projectDetails.textContent = 'Projektet kunde inte hittas.';
    }
});
