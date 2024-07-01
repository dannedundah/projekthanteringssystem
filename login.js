document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Enkla användaruppgifter för demo
        const validUsername = 'delidel';
        const validPassword = 'energilagring';

        if (username === validUsername && password === validPassword) {
            // Spara inloggningsstatus i session lagring
            sessionStorage.setItem('loggedIn', 'true');
            // Omdirigera till huvudsidan
            window.location.href = 'index.html';
        } else {
            errorMessage.textContent = 'Fel användarnamn eller lösenord';
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (sessionStorage.getItem('loggedIn') !== 'true' && window.location.pathname !== '/login.html') {
            window.location.href = 'login.html';
        }
    });
});
