import { auth, createUserWithEmailAndPassword } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert('Registrering lyckades!');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error registering:', error);
            alert('Error registering: ' + error.message);
        }
    });
});
