import { auth, onAuthStateChanged } from './firebase-config.js';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

window.navigateTo = (page) => {
    window.location.href = page;
};
