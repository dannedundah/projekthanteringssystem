import { db, collection, addDoc, getDocs, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectForm = document.getElementById('project-form');
    const projectList = document.getElementById('project-list');

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const projectName = document.getElementById('project-name').value.trim();
        const customerName = document.getElementById('customer-name').value.trim();
        const customerPhone = document.getElementById('customer-phone').value.trim();
        const projectAddress = document.getElementById('project-address').value.trim();
        const projectDescription = document.getElementById('project-description').value.trim();
        const projectStatus = document.getElementById('project-status').value;
        const projectFiles = document.getElementById('project-files').files;

        const fileUrls = [];
        for (const file of projectFiles) {
            const storageRef = ref(storage, `project_files/${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            fileUrls.push(downloadURL);
        }

        await addDoc(collection(db, 'projects'), {
            name: projectName,
            customerName: customerName,
            customerPhone: customerPhone,
            address: projectAddress,
            description: projectDescription,
            status: projectStatus,
            files: fileUrls
        });
        alert('Projekt tillagt!');
        loadProjects();
    });

    async function loadProjects() {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        projectList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const project = doc.data();
            const div = document.createElement('div');
            div.textContent = `${project.name} - ${project.customerName}`;
            projectList.appendChild(div);
        });
    }

    loadProjects();
});
