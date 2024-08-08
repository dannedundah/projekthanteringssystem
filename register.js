import { auth, createUserWithEmailAndPassword, updateProfile } from './firebase-config.js';

const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
            displayName: `${firstName} ${lastName}`
        });
        alert('User registered successfully!');
        // Redirect or other actions
    } catch (error) {
        console.error('Error registering user:', error);
        alert('Error registering user.');
    }
});
