import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const db = getFirestore();

document.addEventListener('DOMContentLoaded', async () => {
    const projectDetails = document.getElementById('project-details');
    const params = new URLSearchParams(window.location.search);
    const projectName = params.get('name');

    try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projects = querySnapshot.docs.map(doc => doc.data());
        const project = projects.find(p => p.name === projectName);

        if (project) {
            projectDetails.innerHTML = `
                <h2>${project.name}</h2>
                <p><strong>Kundnamn:</strong> ${project.customerName}</p>
                <p><strong>Telefonnummer:</strong> ${project.customerPhone}</p>
                <p><strong>Adress:</strong> ${project.address}</p>
                <p><strong>Beskrivning:</strong> ${project.description}</p>
                <p><strong>Status:</strong> ${project.status}</p>
            `;
        } else {
            projectDetails.textContent = 'Projektet kunde inte hittas.';
        }
    } catch (error) {
        console.error('Error fetching project details:', error);
        projectDetails.textContent = 'Ett fel uppstod vid hämtning av projektdata.';
    }
});
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projekthantering - Projektdetalj</title>
    <link rel="stylesheet" href="styles.css">
    <script type="module" src="firebase-config.js"></script>
    <script type="module" src="projektdetalj.js"></script>
</head>
<body>
    <div class="container">
        <h1>Projektdetalj</h1>
        <div id="project-details"></div>
        <button onclick="navigateTo('projektlista.html')">Tillbaka</button>
    </div>
    <script>
        function navigateTo(page) {
            window.location.href = page;
        }
    </script>
</body>
</html>
