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

// Visa endast uppladdningssektionen för användaren med rätt e-post
onAuthStateChanged(auth, async (user) => {
    if (user && user.email === 'daniel@delidel.se') {
        uploadSection.style.display = 'block'; // Visa uppladdningssektionen
        loadFileList(); // Ladda filerna
    } else if (user) {
        loadFileList(); // Ladda filerna för andra användare
    } else {
        alert('Du måste vara inloggad för att se denna sida.');
        window.location.href = 'login.html'; // Skicka till inloggningssidan om användaren inte är inloggad
    }
});

// Ladda upp flera filer
uploadFileBtn.addEventListener('click', async () => {
    const files = fileInput.files;
    if (files.length === 0) {
        alert('Vänligen välj minst en fil att ladda upp.');
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `arbetsmiljo/${file.name}`);
        try {
            await uploadBytes(storageRef, file);
            console.log(`${file.name} uppladdad!`);
        } catch (error) {
            console.error(`Fel vid uppladdning av ${file.name}:`, error);
            alert(`Fel vid uppladdning av ${file.name}.`);
        }
    }

    alert('Alla filer har laddats upp!');
    fileInput.value = '';
    loadFileList(); // Uppdatera listan med filer efter uppladdning
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
