import { auth, signInWithEmailAndPassword, db, getDoc, doc } from './firebase-config.js';

// Funktion för att hantera inloggningen
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Hämta användarens dokument från Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists() && userDoc.data().active) {
            alert('Inloggad!');
            window.location.href = 'index.html';
        } else {
            await auth.signOut();
            alert('Din användare är inte aktiv. Kontakta administratören.');
        }
    } catch (error) {
        console.error('Fel vid inloggning:', error);
        alert('Ett fel uppstod vid inloggning: ' + error.message);
    }
}

// Koppla loginUser till formuläret
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await loginUser(email, password);
});
