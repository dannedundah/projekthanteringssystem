document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-project-btn').addEventListener('click', () => navigateTo('läggatillprojekt.html'));
    document.getElementById('planning-btn').addEventListener('click', () => navigateTo('planering.html'));
    document.getElementById('view-schedule-btn').addEventListener('click', () => navigateTo('se-schema.html'));
    document.getElementById('status-btn').addEventListener('click', () => navigateTo('status.html'));
});

function navigateTo(page) {
    window.location.href = page;
}
