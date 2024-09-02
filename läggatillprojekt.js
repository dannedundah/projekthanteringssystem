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
        const customerEmail = document.getElementById('customer-email').value.trim(); // Hämta e-postvärdet
        const projectAddress = document.getElementById('project-address').value.trim();
        const projectDescriptionValue = projectDescription.value.trim();
        const projectStatus = document.getElementById('project-status').value.trim();
        const projectFiles = document.getElementById('project-files').files;

        const imageUrls = [];
        const fileUrls = [];

        try {
            for (const file of projectFiles) {
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
                const fileType = file.type.startsWith('image/') ? 'project_images' : 'project_files';
                const storageRef = ref(storage, `${fileType}/${uniqueFileName}`);
                const snapshot = await uploadBytes(storageRef, file);
                const fileUrl = await getDownloadURL(snapshot.ref);

                if (fileType === 'project_images') {
                    imageUrls.push({ name: file.name, url: fileUrl });
                } else {
                    fileUrls.push({ name: file.name, url: fileUrl });
                }
            }

            const project = {
                name: projectName,
                customerName,
                customerPhone,
                customerEmail,  // Lägg till e-post i projektobjektet
                address: projectAddress,
                description: projectDescriptionValue,
                status: projectStatus,
                images: imageUrls, // Array med objekt som innehåller bildens namn och URL
                files: fileUrls,   // Array med objekt som innehåller filens namn och URL
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
