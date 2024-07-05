import { auth, createUserWithEmailAndPassword } from './firebase-config.js';

const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = registerForm['email'].value;
    const password = registerForm['password'].value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Registered:', userCredential.user);
            window.location.href = 'login.html';
        })
        .catch((error) => {
            console.error('Error registering:', error);
            alert('Ett fel uppstod vid registrering.');
        });
});
