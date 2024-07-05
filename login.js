import { auth, signInWithEmailAndPassword } from './firebase-config.js';

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm['email'].value;
    const password = loginForm['password'].value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Logged in:', userCredential.user);
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error logging in:', error);
            alert('Fel e-post eller lösenord.');
        });
});
