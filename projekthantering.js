import { addDoc, collection } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('project-form');

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const project = {
            name: document.getElementById('project-input').value.trim(),
            customerName: document.getElementById('customer-name').value.trim(),
            customerPhone: document.getElementById('customer-phone').value.trim(),
            address: document.getElementById('project-address').value.trim(),
            description: document.getElementById('project-description').value.trim(),
            status: document.getElementById('project-status').value.trim()
        };

        try {
            await addDoc(collection(db, 'projects'), project);
            alert('Projektet har lagts till!');
            window.location.href = 'projektlista.html';
        } catch (error) {
            console.error('Error adding project: ', error);
        }
    });
});
