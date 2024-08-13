import { auth, signInWithEmailAndPassword, db, getDoc, doc } from './firebase-config.js';

async function loginUser(email, password) {
    const errorMessageDiv = document.getElementById('error-message');
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Hämta användarens dokument
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists() && userDoc.data().active) {
            window.location.href = 'index.html';
        } else {
            await auth.signOut();
            errorMessageDiv.textContent = 'Din användare är inte aktiv. Kontakta administratören.';
        }
    } catch (error) {
        console.error('Fel vid inloggning:', error);
        errorMessageDiv.textContent = 'Fel vid inloggning: ' + error.message;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await loginUser(email, password);
    });
});
