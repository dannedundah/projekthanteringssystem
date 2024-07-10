import { auth, signInWithPopup, GoogleAuthProvider } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Här kan du använda popup-metoden istället för e-post och lösenord
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            // Inloggning lyckades
            const user = result.user;
            console.log('User signed in:', user);
            localStorage.setItem('loggedIn', 'true');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing in:', error);
            errorMessage.textContent = 'Fel användarnamn eller lösenord';
        }
    });
});
