import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginErrorMessage = document.getElementById('login-error-message');
    const registerErrorMessage = document.getElementById('register-error-message');

    // Hantera inloggning
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Inloggning lyckades
                localStorage.setItem('loggedIn', 'true');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                // Hantera inloggningsfel
                loginErrorMessage.textContent = 'Fel e-post eller lösenord';
                console.error('Error logging in: ', error);
            });
    });

    // Hantera registrering
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Registrering lyckades
                alert('Registrering lyckades! Du kan nu logga in.');
            })
            .catch((error) => {
                // Hantera registreringsfel
                registerErrorMessage.textContent = 'Registrering misslyckades';
                console.error('Error registering: ', error);
            });
    });

    // Kontrollera autentiseringsstatus
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = 'index.html';
        }
    });
});
