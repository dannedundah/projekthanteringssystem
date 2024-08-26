import { db, collection, query, where, getDocs, auth, signInWithEmailAndPassword } from './firebase-config.js';

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Hämta användarinformation från Firestore
        const q = query(collection(db, 'users'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            localStorage.setItem('userFirstName', userData.firstName);
            localStorage.setItem('userLastName', userData.lastName);
        });

        console.log('User logged in and user data stored in localStorage:', user);
    } catch (error) {
        console.error('Error logging in user:', error);
    }
}
// Funktion för att kontrollera om användaren är inloggad och aktiv
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().active) {
            console.log('User is active and authenticated.');
        } else {
            await signOut(auth);
            alert('Din användare är inte aktiv eller har inte rätt behörighet. Kontakta administratören.');
            window.location.href = 'login.html';
        }
    } else {
        console.log('No user is signed in.');
        window.location.href = 'login.html';
    }
});