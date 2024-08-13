import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; 

const auth = getAuth();
const db = getFirestore();

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
        await auth.signOut();

        alert('Användare registrerad. Vänta på verifiering från administratören.');

    } catch (error) {
        console.error('Fel vid registrering:', error);
        alert('Ett fel uppstod vid registrering.');
    }
}
