document.getElementById('calculatorForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Förhindrar att formuläret skickas

    // Hämta värden från formuläret
    const panels = parseInt(document.getElementById('panels').value);
    const panelType = document.getElementById('panelSort').value;
    const inverter1Price = parseInt(document.getElementById('inverter1').value);
    const inverter2Price = parseInt(document.getElementById('inverter2').value);
    const batteryPrice = parseInt(document.getElementById('battery').value);

    // Använd funktionen för att få priset för den valda panelen
    const panelSortPrice = getPanelPrice(panelType);

    // Beräkna totala kostnaden
    const totalCost = (panels * panelSortPrice) + inverter1Price + inverter2Price + batteryPrice;

    // Visa resultatet
    document.getElementById('totalCost').textContent = `Total Kostnad: ${totalCost} SEK`;
});

function getPanelPrice(panelType) {
    switch(panelType) {
        case "DMEGC":
            return 600;
        case "JA405":
            return 500;
        case "JA370":
            return 1000;
        case "Eurener":
            return 1710;
        case "Maysun":
            return 1250;
        case "IBC405":
            return 850;
        case "JA 435":
            return 795;
        default:
            return 0; // Om inget matchar
    }
}
