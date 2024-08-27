import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculate-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateTotal);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Auth state observer
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Användaren är inloggad
            console.log('User is signed in:', user);
        } else {
            // Ingen användare är inloggad
            window.location.href = 'login.html';
        }
    });
});

function calculateTotal() {
    // Hämta värden från fälten
    var panelType = document.getElementById('panelType').value;
    var inverter1 = document.getElementById('inverter1').value;
    var inverter2 = document.getElementById('inverter2').value;
    var battery = document.getElementById('battery').value;
    var charger = document.getElementById('charger').value;
    var checkwatt = document.getElementById('checkwatt').value;
    var extraRoofAreas = document.getElementById('extraRoofAreas').value * 1000; // Antal extra takytor
    var horizontalPanels = document.getElementById('horizontalPanels').value * 500; // Liggande paneler
    var loadBalancer = document.getElementById('loadBalancer').value;
    var additionalCosts = document.getElementById('additionalCosts').value;
    var discount = document.getElementById('discount').value;

    // Beräkna totalpriset
    var totalPrice = parseInt(panelType) + parseInt(inverter1) + parseInt(inverter2) +
                     parseInt(battery) + parseInt(charger) + parseInt(checkwatt) +
                     parseInt(extraRoofAreas) + parseInt(horizontalPanels) + parseInt(loadBalancer) +
                     parseInt(additionalCosts) - parseInt(discount);

    // Visa totalpriset
    document.getElementById('totalPrice').innerText = totalPrice + ' SEK';
}

async function logout() {
    try {
        await signOut(auth);
        alert('Du har loggats ut.');
        window.location.href = 'login.html'; // Redirect to login page after logout
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Ett fel uppstod vid utloggning.');
    }
}
