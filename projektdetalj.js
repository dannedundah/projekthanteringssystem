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
                if (fileGallery && project.files) {
                    fileGallery.innerHTML = '';
                    project.files.forEach(fileUrl => {
                        if (typeof fileUrl === 'string') {
                            const fileExtension = fileUrl.split('.').pop().toLowerCase();
                            let fileElement;

                            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                                fileElement = document.createElement('img');
                                fileElement.src = fileUrl;
                                fileElement.alt = 'Project File';
                                fileElement.style.maxWidth = '150px';
                                fileElement.style.cursor = 'pointer';
                                fileElement.onclick = () => window.open(fileUrl, '_blank');
                            } else {
                                fileElement = document.createElement('a');
                                fileElement.href = fileUrl;
                                fileElement.textContent = `Ladda ner fil (${fileExtension.toUpperCase()})`;
                                fileElement.target = '_blank';
                            }

                            fileGallery.appendChild(fileElement);
                        } else {
                            console.error('Invalid file URL:', fileUrl);
                        }
                    });
                } else {
                    console.error('Element with ID "file-gallery" not found or project.files is undefined.');
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
                    const imageUrls = project.files || [];

                    try {
                        for (const file of projectImages) {
                            const storageRef = ref(storage, `project_files/${file.name}`);
                            const snapshot = await uploadBytes(storageRef, file);
                            const imageUrl = await getDownloadURL(snapshot.ref);
                            imageUrls.push(imageUrl);
                        }

                        updatedProject.files = imageUrls;

                        await updateDoc(projectRef, updatedProject);
                        alert('Projektet har uppdaterats!');
                        window.location.href = 'projekthantering.html';
                    } catch (error) {
                        console.error('Error updating project:', error);
                        alert('Ett fel uppstod vid uppdatering av projektet.');
                    }
                });
            } else {
                console.error('Project not found.');
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
        }
    } else {
        console.error('No project ID specified.');
    }
});

function navigateTo(page) {
    window.location.href = page;
}

