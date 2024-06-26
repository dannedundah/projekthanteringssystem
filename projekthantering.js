import { db, collection, addDoc, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('project-form');

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectName = document.getElementById('project-input').value.trim();
        const customerName = document.getElementById('customer-name').value.trim();
        const customerPhone = document.getElementById('customer-phone').value.trim();
        const projectAddress = document.getElementById('project-address').value.trim();
        const projectDescription = document.getElementById('project-description').value.trim();
        const projectStatus = document.getElementById('project-status').value.trim();
        const projectImage = document.getElementById('project-image').files[0];

        if (projectImage) {
            const storageRef = ref(storage, 'project_images/' + projectImage.name);
            await uploadBytes(storageRef, projectImage);
            const imageUrl = await getDownloadURL(storageRef);

            const project = {
                name: projectName,
                customerName: customerName,
                customerPhone: customerPhone,
                address: projectAddress,
                description: projectDescription,
                status: projectStatus,
                imageUrl: imageUrl
            };

            try {
                await addDoc(collection(db, 'projects'), project);
                alert('Projektet har lagts till!');
                window.location.href = 'projektlista.html';
            } catch (error) {
                console.error('Error adding project: ', error);
            }
        }
    });
});
