import { auth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const googleLoginBtn = document.getElementById('google-login-btn');
    const mainContent = document.getElementById('main-content');

    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error logging in with Google:', error);
        }
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            googleLoginBtn.style.display = 'none';
            mainContent.style.display = 'block';
            setupMainButtons();
        } else {
            googleLoginBtn.style.display = 'block';
            mainContent.style.display = 'none';
        }
    });
});

function setupMainButtons() {
    document.getElementById('add-project-btn').addEventListener('click', () => navigateTo('läggatillprojekt.html'));
    document.getElementById('planning-btn').addEventListener('click', () => navigateTo('planering.html'));
    document.getElementById('view-schedule-btn').addEventListener('click', () => navigateTo('se-schema.html'));
    document.getElementById('status-btn').addEventListener('click', () => navigateTo('status.html'));
}

function navigateTo(page) {
    window.location.href = page;
}
