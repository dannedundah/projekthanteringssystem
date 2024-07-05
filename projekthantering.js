import { db, collection, addDoc, getDocs, updateDoc, doc, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

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
        const projectStatus = document.getElementById('project-status').value.trim();
        const projectFiles = document.getElementById('project-files').files;

        const fileUrls = [];

        try {
            for (const file of projectFiles) {
                const storageRef = ref(storage, `project_files/${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const fileUrl = await getDownloadURL(snapshot.ref);
                fileUrls.push(fileUrl);
            }

            const project = {
                name: projectName,
                customerName,
                customerPhone,
                address: projectAddress,
                description: projectDescription,
                status: projectStatus,
                files: fileUrls,
            };

            await addDoc(collection(db, 'projects'), project);
            alert('Projektet har lagts till!');
            fetchProjects(); // Refresh project list
        } catch (error) {
            console.error('Error adding project:', error);
            alert('Ett fel uppstod vid tillägg av projekt.');
        }
    });

    const fetchProjects = async () => {
        projectList.innerHTML = '';
        try {
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            projects.forEach(project => {
                const li = document.createElement('li');
                li.textContent = `${project.name} - ${project.customerName} - ${project.status}`;
                li.addEventListener('click', () => {
                    window.location.href = `projekt-detalj.html?id=${project.id}`;
                });
                projectList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    fetchProjects();
});
