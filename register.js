import { auth, createUserWithEmailAndPassword, updateProfile, signOut } from './firebase-config.js';
import { db, setDoc, doc } from './firebase-config.js';

async function registerUser(email, password, firstName, lastName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Spara användardata med inaktiv status
        await setDoc(doc(db, 'users', user.uid), {
            firstName: firstName,
            lastName: lastName,
            email: email,
            active: false // Markera som inaktiv
        });

        // Uppdatera profilnamn
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`
        });

        // Logga ut användaren direkt efter registrering
        await signOut(auth);

        alert('Användare registrerad. Vänta på verifiering från administratören.');
        window.location.href = 'login.html'; // Skicka användaren till inloggningssidan
    } catch (error) {
        console.error('Fel vid registrering:', error);
        alert('Ett fel uppstod vid registrering.');
    }
}

// Eventuell kod för att hantera formuläret:
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const firstName = document.getElementById('register-firstname').value;
    const lastName = document.getElementById('register-lastname').value;

    await registerUser(email, password, firstName, lastName);
});
