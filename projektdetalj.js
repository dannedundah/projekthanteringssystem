import { db, doc, getDoc, collection, addDoc, updateDoc, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const projectDetails = document.getElementById('project-details');

    try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            const project = projectSnap.data();
            projectDetails.innerHTML = `
                <h2>${project.name}</h2>
                <p><strong>Kundnamn:</strong> ${project.customerName}</p>
                <p><strong>Telefonnummer:</strong> ${project.customerPhone}</p>
                <p><strong>Adress:</strong> ${project.address}</p>
                <p><strong>Beskrivning:</strong> ${project.description}</p>
                <p><strong>Status:</strong> ${project.status}</p>
            `;

            // Load and display images
            if (project.images) {
                project.images.forEach(imageUrl => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.style.maxWidth = '100%';
                    projectDetails.appendChild(img);
                });
            }
        } else {
            projectDetails.textContent = 'Projektet kunde inte hittas.';
        }
    } catch (error) {
        console.error('Error fetching project details:', error);
    }

    document.getElementById('upload-images-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const projectImages = document.getElementById('project-images').files;
        const imageUrls = [];

        try {
            for (const file of projectImages) {
                const storageRef = ref(storage, `project_images/${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(snapshot.ref);
                imageUrls.push(imageUrl);
            }

            await updateDoc(doc(db, 'projects', projectId), {
                images: imageUrls
            });

            alert('Bilderna har laddats upp!');
            location.reload();
        } catch (error) {
            console.error('Error uploading images:', error);
        }
    });

    document.getElementById('schedule-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeName = document.getElementById('employee-name').value.trim();
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        const schedule = {
            name: employeeName,
            startDate: startDate,
            endDate: endDate,
            projectId: projectId
        };

        try {
            await addDoc(collection(db, 'schedules'), schedule);
            alert('Schema har lagts till!');
        } catch (error) {
            console.error('Error adding schedule:', error);
        }
    });

    window.navigateTo = (page) => {
        window.location.href = page;
    };
});
