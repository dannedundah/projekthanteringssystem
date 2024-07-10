import { auth, signInWithEmailAndPassword } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem('loggedIn', 'true');
            window.location.href = 'projekthantering.html';
        } catch (error) {
            console.error('Error logging in:', error);
            errorMessage.textContent = 'Fel användarnamn eller lösenord';
        }
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await auth.signOut();
            localStorage.removeItem('loggedIn');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    });
});

window.navigateTo = (page) => {
    window.location.href = page;
};
