import { db, doc, getDoc, updateDoc, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const editProjectForm = document.getElementById('edit-project-form');
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const projectDetails = document.getElementById('project-details');
    const projectImagesContainer = document.getElementById('project-images-container');

    if (projectId) {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const projectSnap = await getDoc(projectRef);

            if (projectSnap.exists()) {
                const project = projectSnap.data();
                document.getElementById('project-name').value = project.name;
                document.getElementById('customer-name').value = project.customerName;
                document.getElementById('customer-phone').value = project.customerPhone;
                document.getElementById('project-address').value = project.address;
                document.getElementById('project-description').value = project.description;
                document.getElementById('project-status').value = project.status;

                // Display images if they exist
                if (project.images && project.images.length > 0) {
                    projectImagesContainer.innerHTML = '';
                    project.images.forEach(url => {
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = 'Project Image';
                        img.classList.add('project-image'); // You can style the image with this class
                        projectImagesContainer.appendChild(img);
                    });
                } else {
                    projectImagesContainer.innerHTML = 'Inga bilder tillgängliga.';
                }

                editProjectForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const updatedProject = {
                        name: document.getElementById('project-name').value.trim(),
                        customerName: document.getElementById('customer-name').value.trim(),
                        customerPhone: document.getElementById('customer-phone').value.trim(),
                        address: document.getElementById('project-address').value.trim(),
                        description: document.getElementById('project-description').value.trim(),
                        status: document.getElementById('project-status').value.trim(),
                    };

                    const projectImages = document.getElementById('project-images').files;
                    const imageUrls = project.images || [];

                    try {
                        for (const file of projectImages) {
                            const storageRef = ref(storage, `project_images/${file.name}`);
                            const snapshot = await uploadBytes(storageRef, file);
                            const imageUrl = await getDownloadURL(snapshot.ref);
                            imageUrls.push(imageUrl);
                        }

                        updatedProject.images = imageUrls;

                        await updateDoc(projectRef, updatedProject);
                        alert('Projektet har uppdaterats!');
                        window.location.href = 'projekthantering.html';
                    } catch (error) {
                        console.error('Error updating project:', error);
                        alert('Ett fel uppstod vid uppdatering av projektet.');
                    }
                });
            } else {
                projectDetails.textContent = 'Projektet kunde inte hittas.';
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
            projectDetails.textContent = 'Ett fel uppstod vid hämtning av projektdata.';
        }
    } else {
        projectDetails.textContent = 'Inget projekt ID angivet.';
    }
});

function navigateTo(page) {
    window.location.href = page;
}
