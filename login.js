import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore"; 

const auth = getAuth();
const db = getFirestore();

async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Hämta användarens dokument
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
        alert('Ett fel uppstod vid inloggning.');
    }
}
