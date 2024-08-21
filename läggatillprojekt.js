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
        const projectImages = document.getElementById('project-images').files;

        const imageUrls = [];

        try {
            for (const file of projectImages) {
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
                const storageRef = ref(storage, `project_images/${uniqueFileName}`);
                const snapshot = await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(snapshot.ref);
                imageUrls.push(imageUrl);
            }

            const project = {
                name: projectName,
                customerName,
                customerPhone,
                address: projectAddress,
                description: projectDescription,
                status: projectStatus,
                images: imageUrls,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'projects'), project);
            alert('Projektet har lagts till!');
            window.location.href = 'projekthantering.html';
        } catch (error) {
            console.error('Error adding project:', error);
            alert('Ett fel uppstod vid tillägg av projekt.');
        }
    });
});
