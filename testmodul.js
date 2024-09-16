import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

const auth = getAuth();
const storage = getStorage();

// DOM-element
const uploadSection = document.getElementById('upload-section');
const fileInput = document.getElementById('fileInput');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const fileList = document.getElementById('fileList');
const logoutBtn = document.getElementById('logout-btn');

// Visa endast uppladdningssektionen för den godkända användaren
onAuthStateChanged(auth, async (user) => {
    if (user && user.email === 'daniel@delidel.se') {
        uploadSection.style.display = 'block';
        loadFileList();
    } else if (user) {
        loadFileList();
    } else {
        alert('Du måste vara inloggad för att se denna sida.');
        window.location.href = 'login.html';
    }
});

// Ladda upp fil
uploadFileBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Vänligen välj en fil att ladda upp.');
        return;
    }

    const storageRef = ref(storage, `arbetsmiljo/${file.name}`);
    try {
        await uploadBytes(storageRef, file);
        alert('Fil uppladdad!');
        fileInput.value = '';
        loadFileList();
    } catch (error) {
        console.error('Fel vid uppladdning:', error);
        alert('Fel vid uppladdning av fil.');
    }
});

// Visa listan över uppladdade filer
async function loadFileList() {
    const listRef = ref(storage, 'arbetsmiljo/');
    const fileListSnapshot = await listAll(listRef);
    
    fileList.innerHTML = '';
    fileListSnapshot.items.forEach(async (itemRef) => {
        const fileURL = await getDownloadURL(itemRef);
        const listItem = document.createElement('li');
        listItem.innerHTML = `<a href="${fileURL}" target="_blank">${itemRef.name}</a>`;
        fileList.appendChild(listItem);
    });
}

// Logga ut
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert('Du har loggats ut.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Fel vid utloggning:', error);
        alert('Fel vid utloggning.');
    }
});
