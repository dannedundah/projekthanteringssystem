import { db, collection, getDocs } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Fetching projects...');
    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Projects:', projects);
        // Additional code to handle the fetched projects if needed
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});
