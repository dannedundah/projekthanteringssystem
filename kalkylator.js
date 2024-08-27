document.getElementById('calculatorForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Förhindrar att formuläret skickas

    // Hämta värden från formuläret
    const panels = parseInt(document.getElementById('panels').value);
    const panelSortPrice = parseInt(document.getElementById('panelSort').value);
    const inverter1Price = parseInt(document.getElementById('inverter1').value);
    const inverter2Price = parseInt(document.getElementById('inverter2').value);
    const batteryPrice = parseInt(document.getElementById('battery').value);

    // Beräkna totala kostnaden
    const totalCost = (panels * panelSortPrice) + inverter1Price + inverter2Price + batteryPrice;

    // Visa resultatet
    document.getElementById('totalCost').textContent = `Total Kostnad: ${totalCost} SEK`;
});
