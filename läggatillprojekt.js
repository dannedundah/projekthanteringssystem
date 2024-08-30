import { db, collection, addDoc, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('project-form');
    const projectDescription = document.getElementById('project-description');

    // Sätt standardtexten i projektbeskrivningen när sidan laddas
    const defaultDescription = `
Paneler:
Växelriktare:
Batteri:
Laddbox:
Innertak:
    `;
    projectDescription.value = defaultDescription.trim();

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectName = document.getElementById('project-input').value.trim();
        const customerName = document.getElementById('customer-name').value.trim();
        const customerPhone = document.getElementById('customer-phone').value.trim();
        const projectAddress = document.getElementById('project-address').value.trim();
        const projectDescriptionValue = projectDescription.value.trim();
        const projectStatus = document.getElementById('project-status').value.trim();
        const projectImages = document.getElementById('project-images').files;
        const projectFiles = document.getElementById('project-files').files;

        const imageUrls = [];
        const fileUrls = [];

        try {
            // Ladda upp bilder
            for (const file of projectImages) {
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
                const storageRef = ref(storage, `project_images/${uniqueFileName}`);
                const snapshot = await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(snapshot.ref);
                imageUrls.push({ name: file.name, url: imageUrl });
            }

            // Ladda upp andra filer
            for (const file of projectFiles) {
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
                const storageRef = ref(storage, `project_files/${uniqueFileName}`);
                const snapshot = await uploadBytes(storageRef, file);
                const fileUrl = await getDownloadURL(snapshot.ref);
                fileUrls.push({ name: file.name, url: fileUrl });
            }

            const project = {
                name: projectName,
                customerName,
                customerPhone,
                address: projectAddress,
                description: projectDescriptionValue,
                status: projectStatus,
                images: imageUrls, // Array med objekt som innehåller bildens namn och URL
                files: fileUrls, // Array med objekt som innehåller filens namn och URL
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'projects'), project);
            alert('Projektet har lagts till!');
            window.location.href = 'status.html';
        } catch (error) {
            console.error('Error adding project:', error);
            alert('Ett fel uppstod vid tillägg av projekt.');
        }
    });
});
