import { auth, createUserWithEmailAndPassword } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            localStorage.setItem('loggedIn', 'true');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error registering:', error);
            errorMessage.textContent = 'Registrering misslyckades';
        }
    });
});
