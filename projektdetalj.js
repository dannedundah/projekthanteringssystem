import { db, collection, getDocs, storage, ref, uploadBytes, getDownloadURL, doc, updateDoc } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectDetails = document.getElementById('project-details');
    const uploadedImages = document.getElementById('uploaded-images');
    const uploadForm = document.getElementById('upload-form');
    const additionalImage = document.getElementById('additional-image');
    const params = new URLSearchParams(window.location.search);
    const projectName = params.get('name');

    let currentProject;

    try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projects = querySnapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() };
        });
        const project = projects.find(p => p.name === projectName);
        currentProject = project;

        if (project) {
            projectDetails.innerHTML = `
                <h2>${project.name}</h2>
                <p><strong>Kundnamn:</strong> ${project.customerName}</p>
                <p><strong>Telefonnummer:</strong> ${project.customerPhone}</p>
                <p><strong>Adress:</strong> ${project.address}</p>
                <p><strong>Beskrivning:</strong> ${project.description}</p>
                <p><strong>Status:</strong> ${project.status}</p>
                <img src="${project.imageUrl}" alt="Projektbild" style="max-width: 100%;">
            `;
            if (project.additionalImages) {
                project.additionalImages.forEach(imageUrl => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.style.maxWidth = '100%';
                    uploadedImages.appendChild(img);
                });
            }
        } else {
            projectDetails.textContent = 'Projektet kunde inte hittas.';
        }
    } catch (error) {
        console.error('Error fetching project details:', error);
        projectDetails.textContent = 'Ett fel uppstod vid hämtning av projektdata.';
    }

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = additionalImage.files[0];
        if (file && currentProject) {
            const storageRef = ref(storage, 'project_images/' + file.name);
            await uploadBytes(storageRef, file);
            const imageUrl = await getDownloadURL(storageRef);

            if (!currentProject.additionalImages) {
                currentProject.additionalImages = [];
            }
            currentProject.additionalImages.push(imageUrl);

            try {
                await updateProjectImages(currentProject.id, currentProject.additionalImages);
                const img = document.createElement('img');
                img.src = imageUrl;
                img.style.maxWidth = '100%';
                uploadedImages.appendChild(img);
            } catch (error) {
                console.error('Error updating project images:', error);
            }
        }
    });
});

async function updateProjectImages(projectId, images) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
        additionalImages: images
    });
}
