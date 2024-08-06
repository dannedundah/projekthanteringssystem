import { db, doc, getDoc, updateDoc, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const editProjectForm = document.getElementById('edit-project-form');
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

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

                const fileGallery = document.getElementById('file-gallery');
                if (project.files && project.files.length > 0) {
                    project.files.forEach(file => {
                        const fileExtension = file.url.split('.').pop().toLowerCase();
                        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                            const img = document.createElement('img');
                            img.src = file.url;
                            img.alt = file.name;
                            img.classList.add('thumbnail');
                            img.onclick = () => openModal(file.url);
                            fileGallery.appendChild(img);
                        } else {
                            const fileLink = document.createElement('a');
                            fileLink.href = file.url;
                            fileLink.target = '_blank';
                            fileLink.textContent = `Öppna ${file.name}`;
                            fileLink.classList.add('file-link');
                            fileLink.style.display = 'block';
                            fileGallery.appendChild(fileLink);
                        }
                    });
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

                    const projectFiles = document.getElementById('project-images').files;
                    const uploadedFiles = project.files || [];

                    try {
                        for (const file of projectFiles) {
                            const storageRef = ref(storage, `project_files/${file.name}`);
                            const snapshot = await uploadBytes(storageRef, file);
                            const fileUrl = await getDownloadURL(snapshot.ref);
                            uploadedFiles.push({ name: file.name, url: fileUrl });
                        }

                        updatedProject.files = uploadedFiles;

                        await updateDoc(projectRef, updatedProject);
                        alert('Projektet har uppdaterats!');
                        window.location.href = 'projekthantering.html';
                    } catch (error) {
                        console.error('Error updating project:', error);
                        alert('Ett fel uppstod vid uppdatering av projektet.');
                    }
                });
            } else {
                console.error('Projektet kunde inte hittas.');
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
        }
    } else {
        console.error('Inget projekt ID angivet.');
    }
});

function openModal(imageUrl) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    modal.style.display = 'block';
    modalImage.src = imageUrl;
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';
}

function navigateTo(page) {
    window.location.href = page;
}
