document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('project-form');
    const projectInput = document.getElementById('project-input');
    const customerNameInput = document.getElementById('customer-name');
    const customerPhoneInput = document.getElementById('customer-phone');
    const projectAddressInput = document.getElementById('project-address');
    const projectDescriptionInput = document.getElementById('project-description');
    const projectStatusInput = document.getElementById('project-status');
    const projectList = document.getElementById('project-list');

    const addScheduleForm = document.getElementById('add-schedule-form');
    const employeeNameAddInput = document.getElementById('employee-name-add');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const projectSelect = document.getElementById('project-select');
    const scheduleList = document.getElementById('schedule-list');

    const viewScheduleForm = document.getElementById('view-schedule-form');
    const employeeNameViewInput = document.getElementById('employee-name-view');

    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let schedules = JSON.parse(localStorage.getItem('schedules')) || [];

    // Project handling
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const projectName = projectInput.value.trim();
            const customerName = customerNameInput.value.trim();
            const customerPhone = customerPhoneInput.value.trim();
            const projectAddress = projectAddressInput.value.trim();
            const projectDescription = projectDescriptionInput.value.trim();
            const projectStatus = projectStatusInput.value;

            if (projectName !== '' && customerName !== '' && customerPhone !== '' && projectAddress !== '' && projectDescription !== '' && projectStatus !== '') {
                addProject(projectName, customerName, customerPhone, projectAddress, projectDescription, projectStatus);
                projectInput.value = '';
                customerNameInput.value = '';
                customerPhoneInput.value = '';
                projectAddressInput.value = '';
                projectDescriptionInput.value = '';
                projectStatusInput.value = 'Ny';
            }
        });
        renderProjects();
    }

    function addProject(name, customerName, customerPhone, address, description, status) {
        const project = { name, customerName, customerPhone, address, description, status };
        projects.push(project);
        localStorage.setItem('projects', JSON.stringify(projects));
        renderProjects();
    }

    function renderProjects() {
        if (projectList) {
            projectList.innerHTML = '';
            projects.forEach(project => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>Projekt:</strong> ${project.name} <br>
                    <strong>Kund:</strong> ${project.customerName} <br>
                    <strong>Telefon:</strong> ${project.customerPhone} <br>
                    <strong>Adress:</strong> ${project.address} <br>
                    <strong>Beskrivning:</strong> ${project.description} <br>
                    <strong>Status:</strong> ${project.status}
                `;
                projectList.appendChild(li);
            });
        }
        if (projectSelect) {
            projectSelect.innerHTML = '';
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.name;
                option.textContent = project.name;
                projectSelect.appendChild(option);
            });
        }
    }

    // Schedule handling
    if (addScheduleForm) {
        addScheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const employeeName = employeeNameAddInput.value.trim();
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const projectName = projectSelect.value;

            if (employeeName !== '' && startDate !== '' && endDate !== '' && projectName !== '') {
                addSchedule(employeeName, startDate, endDate, projectName);
                employeeNameAddInput.value = '';
                startDateInput.value = '';
                endDateInput.value = '';
                projectSelect.value = '';
            }
        });
    }

    if (viewScheduleForm) {
        viewScheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const employeeName = employeeNameViewInput.value.trim();
            if (employeeName !== '') {
                showSchedule(employeeName);
            }
        });
    }

    function addSchedule(name, startDate, endDate, project) {
        const schedule = { name, startDate, endDate, project };
        schedules.push(schedule);
        localStorage.setItem('schedules', JSON.stringify(schedules));
    }

    function showSchedule(name) {
        scheduleList.innerHTML = '';
        const filteredSchedules = schedules.filter(schedule => schedule.name === name);
        if (filteredSchedules.length > 0) {
            filteredSchedules.forEach(schedule => {
                const div = document.createElement('div');
                div.innerHTML = `Startdatum: ${schedule.startDate} - Slutdatum: ${schedule.endDate} - Projekt: <a href="project-detail.html?name=${schedule.project}">${schedule.project}</a>`;
                scheduleList.appendChild(div);
            });
        } else {
            scheduleList.textContent = 'Inga scheman hittades för denna anställd.';
        }
    }

    // Project detail view
    const projectDetails = document.getElementById('project-details');
    if (projectDetails) {
        const params = new URLSearchParams(window.location.search);
        const projectName = params.get('name');
        const project = projects.find(proj => proj.name === projectName);
        if (project) {
            projectDetails.innerHTML = `
                <strong>Projekt:</strong> ${project.name} <br>
                <strong>Kund:</strong> ${project.customerName} <br>
                <strong>Telefon:</strong> ${project.customerPhone} <br>
                <strong>Adress:</strong> ${project.address} <br>
                <strong>Beskrivning:</strong> ${project.description} <br>
                <strong>Status:</strong> ${project.status}
            `;
        } else {
            projectDetails.textContent = 'Projektinformation kunde inte hittas.';
        }
    }

    renderProjects();
});

function navigateTo(page) {
    window.location.href = page;
}
