import { db, doc, getDoc, updateDoc, storage, ref, deleteObject, getDownloadURL, uploadBytes } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const editProjectForm = document.getElementById('edit-project-form');
    const fileGallery = document.getElementById('file-gallery');
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

                if (fileGallery) {
                    fileGallery.innerHTML = '';
                    const files = project.files || [];
                    if (Array.isArray(files)) {
                        files.forEach((file, index) => {
                            const fileUrl = file.url;
                            const fileName = file.name;
                            if (fileUrl && fileName) {
                                const fileExtension = fileName.split('.').pop().toLowerCase();
                                let fileElement;

                                if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                                    // Bild
                                    fileElement = document.createElement('div');
                                    fileElement.innerHTML = `<img src="${fileUrl}" alt="${fileName}" style="max-width: 150px; cursor: pointer;" onclick="window.open('${fileUrl}', '_blank')">`;
                                } else {
                                    // Övriga filer (PDF, etc.)
                                    fileElement = document.createElement('div');
                                    fileElement.innerHTML = `<a href="${fileUrl}" target="_blank">Ladda ner ${fileName} (${fileExtension.toUpperCase()})</a>`;
                                }

                                // Lägg till en ta bort-knapp
                                const removeButton = document.createElement('button');
                                removeButton.textContent = 'Ta bort';
                                removeButton.onclick = async () => await removeFile(fileUrl, index);
                                fileElement.appendChild(removeButton);

                                fileGallery.appendChild(fileElement);
                            } else {
                                console.error('Invalid file data:', file);
                            }
                        });
                    } else {
                        console.error('Project files is not an array:', files);
                    }
                } else {
                    console.error('Element with ID "file-gallery" not found.');
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
                            imageUrls.push({ name: file.name, url: imageUrl });
                        }

                        updatedProject.files = imageUrls;

                        await updateDoc(projectRef, updatedProject);
                        console.log(`Projekt ${projectId} uppdaterat med status: ${updatedProject.status}`);
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

async function removeFile(fileUrl, index) {
    try {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);

        // Remove from Firestore
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('id');
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            const project = projectSnap.data();
            project.files.splice(index, 1);
            await updateDoc(projectRef, { files: project.files });
            alert('Filen har tagits bort!');
            window.location.reload(); // Refresh the page to update the file list
        }
    } catch (error) {
        console.error('Error removing file:', error);
        alert('Ett fel uppstod vid borttagning av filen.');
    }
}

function navigateTo(page) {
    window.location.href = page;
}
