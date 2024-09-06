import { db, collection, addDoc, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';
import { autoScheduleProject } from './planering.js';  // Importera schemaläggningsfunktionen från planering.js

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
Mätarplacering:
Storlek på huvudsäkring:
Nätbolag:
    `;
    projectDescription.value = defaultDescription.trim();

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hämta värden från formuläret
        const projectName = document.getElementById('project-input').value.trim();
        const customerName = document.getElementById('customer-name').value.trim();
        const customerPhone = document.getElementById('customer-phone').value.trim();
        const customerEmail = document.getElementById('customer-email').value.trim(); // Hämta e-postvärdet
        const projectAddress = document.getElementById('project-address').value.trim();
        const projectDescriptionValue = projectDescription.value.trim();
        const projectStatus = document.getElementById('project-status').value.trim();
        const projectFiles = document.getElementById('project-files').files;

        // Ny information för schemaläggning
        const panelCount = parseInt(document.getElementById('panel-count').value.trim());  // Antal paneler
        const travelTime = parseInt(document.getElementById('travel-time').value.trim());  // Restid i minuter

        // Sätt teamstorlek till en fast variabel
        const teamSize = 2;  // Alltid två personer i teamet

        const imageUrls = [];
        const fileUrls = [];

        try {
            // Ladda upp filer och bilder till Firebase Storage
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

            // Skapa nytt projektobjekt
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

            // Spara projektet till Firestore
            const docRef = await addDoc(collection(db, 'projects'), project);

            // Schemalägg projektet automatiskt baserat på antal paneler och restid
            await autoScheduleProject(docRef.id, panelCount, teamSize, travelTime);

            alert('Projektet har lagts till och schemalagts automatiskt!');
            projectForm.reset();
        } catch (error) {
            console.error('Error adding project:', error);
            alert('Ett fel uppstod vid tillägg av projekt.');
        }
    });

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
