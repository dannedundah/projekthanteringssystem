document.addEventListener('DOMContentLoaded', () => {
    const projectList = document.getElementById('project-list');
    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    projects.forEach(project => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="projektdetalj.html?name=${encodeURIComponent(project.name)}">${project.name}</a>`;
        projectList.appendChild(li);
    });
});
