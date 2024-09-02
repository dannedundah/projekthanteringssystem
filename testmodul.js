import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (user.email === 'daniel@delidel.se') {
                // Visa testmodulen om användaren är Daniel
                document.getElementById('test-modul').style.display = 'block';
            } else {
                alert('Du har inte behörighet att se denna sida.');
                window.location.href = 'index.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // Event listener för att köra skript från textarea
    document.getElementById('run-script-btn').addEventListener('click', () => {
        const scriptContent = document.getElementById('script-input').value;
        try {
            // Utvärdera och kör det skrivet JavaScript
            const result = eval(scriptContent);
            document.getElementById('script-output').textContent = `Resultat: ${result}`;
        } catch (error) {
            document.getElementById('script-output').textContent = `Fel: ${error.message}`;
        }
    });
});
