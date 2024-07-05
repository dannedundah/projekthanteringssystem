import { auth, signInWithEmailAndPassword } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User signed in:', userCredential.user);
            // Redirect to the main page
            window.location.href = 'projekthantering.html';
        } catch (error) {
            console.error('Error signing in:', error);
            alert('Error signing in: ' + error.message);
        }
    });
});
