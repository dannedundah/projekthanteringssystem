import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email
      });

      alert('Registrering lyckades!');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Ett fel uppstod vid registrering av användare.');
    }
  });
});
