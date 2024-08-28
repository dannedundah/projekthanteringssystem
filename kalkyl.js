document.getElementById('calculatorForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Förhindrar att formuläret skickas

    // Hämta värden från formuläret
    const panels = parseInt(document.getElementById('panels').value) || 0;
    const panelType = document.getElementById('panelSort').value;
    const inverter1Type = document.getElementById('inverter1').value;
    const inverter2Type = document.getElementById('inverter2').value;
    const batteryType = document.getElementById('battery').value;
    const roofType = document.getElementById('roofType').value;
    const chargerQuantity = parseInt(document.getElementById('charger').value) || 0;
    const checkwattIncluded = document.getElementById('checkwatt').checked ? 10000 : 0;
    const extraRoofType = document.getElementById('extraRoof').value;
    const horizontalPanels = document.getElementById('horizontalPanels').value;
    const loadBalancerPrice = document.getElementById('loadBalancer').checked ? 3000 : 0;

    // Beräkna installerad effekt kW baserat på panelsort
    const installedPower = getInstalledPower(panelType, panels);

    // Beräkna batteri kW och tillhörande kostnad
    const batteryKW = getBatteryKW(batteryType);
    const batteryCost = getBatteryCost(batteryKW);

    // Beräkna pris baserat på installerad effekt
    const powerCost = getPowerCost(installedPower);

    // Beräkna fasta kostnader
    const fallskydd = 2500;
    const frakt = 1000;
    const forbrukningsmaterial = 350 * installedPower;
    const elektriker = 8500;
    const arbetskostnad = 400 * panels;

    // Provision baserat på totalkostnad före provision (exkl. provision)
    const totalBeforeProvision = (panels * getPanelPrice(panelType)) + inverter1Price + inverter2Price + batteryCost + roofMaterialCost + chargerPrice + checkwattIncluded + extraRoofPrice + horizontalPanelPrice + loadBalancerPrice + fallskydd + frakt + forbrukningsmaterial + elektriker + arbetskostnad + powerCost;
    const provision = totalBeforeProvision * 0.01 * 1.25;

    // Beräkna totala kostnaden inklusive fasta kostnader och provision
    const totalCost = totalBeforeProvision + provision;

    // Visa resultatet
    document.getElementById('totalCost').textContent = `Total Kostnad: ${totalCost.toFixed(2)} SEK`;
});

// Funktion för att beräkna priset baserat på panelsort
function getPanelPrice(panelType) {
    switch(panelType) {
        case "DMEGC": return 600;
        case "JA405": return 500;
        case "JA370": return 1000;
        case "Eurener": return 1710;
        case "Maysun": return 1250;
        case "IBC405": return 850;
        case "JA 435": return 795;
        default: return 0;
    }
}

// Funktion för att beräkna installerad effekt kW
function getInstalledPower(panelType, panels) {
    switch(panelType) {
        case "JA405": 
        case "IBC405": 
            return 0.405 * panels;
        case "JA370":
            return 0.37 * panels;
        case "DMEGC":
            return 0.535 * panels;
        case "Eurener":
            return 0.45 * panels;
        case "Maysun":
            return 0.41 * panels;
        case "JA 435":
            return 0.435 * panels;
        default:
            return 0;
    }
}

// Funktion för att beräkna priset baserat på installerad effekt kW
function getPowerCost(installedPower) {
    if (installedPower <= 0) return 0;
    if (installedPower <= 10) return 45000;
    if (installedPower <= 11) return 46500;
    if (installedPower <= 12) return 48000;
    if (installedPower <= 13) return 49500;
    if (installedPower <= 14) return 51000;
    if (installedPower <= 15) return 52500;
    if (installedPower <= 16) return 53500;
    if (installedPower <= 17) return 55000;
    if (installedPower <= 18) return 56500;
    if (installedPower <= 19) return 58000;
    if (installedPower <= 20) return 59500;
    if (installedPower <= 21) return 61000;
    if (installedPower <= 22) return 62500;
    if (installedPower <= 23) return 64000;
    if (installedPower <= 24) return 65500;
    if (installedPower <= 25) return 67000;
    if (installedPower <= 26) return 68500;
    if (installedPower <= 27) return 70000;
    if (installedPower <= 28) return 71500;
    if (installedPower <= 29) return 73000;
    if (installedPower <= 30) return 74500;
    return 0;
}

// Funktion för att beräkna batteri kW baserat på batterityp
function getBatteryKW(batteryType) {
    switch(batteryType) {
        case "SBR096": return 9.6;
        case "SBR128": return 12.8;
        case "SBR160": return 16;
        case "SBR192": return 19.2;
        case "SBR224": return 22.4;
        case "SBR256": return 25.6;
        case "Solax 12kW": return 12;
        case "Pylontech 15kWh": return 15;
        case "Pylontech 10kWh": return 10;
        case "Sigenergy 8kWh": return 8;
        case "Sigenergy 16kWh": return 16;
        case "Sigenergy 24kWh": return 24;
        default: return 0;
    }
}

// Funktion för att beräkna batterikostnad baserat på batteri kW
function getBatteryCost(batteryKW) {
    if (batteryKW === 9.6) return 15000;
    if (batteryKW === 12.8) return 20000;
    if (batteryKW === 16) return 25000;
    if (batteryKW === 19.2) return 30000;
    if (batteryKW === 22.4) return 35000;
    if (batteryKW === 25.6) return 40000;
    if (batteryKW === 15) return 23438;
    if (batteryKW === 10) return 15625;
    if (batteryKW === 12) return 25000;
    if (batteryKW === 8) return 12500;
    if (batteryKW === 24) return 37500;
    return 0;
}

// Uppdaterad funktion för att hantera laddboxpriser
function getChargerPrice(quantity) {
    if (quantity === 1) return 12500;
    if (quantity === 2) return 25000;
    return 0;
}

function getInverter1Price(inverterType) {
    switch(inverterType) {
        case "SH10": return 17750;
        case "SH8": return 18596;
        case "SH6": return 17806;
        case "SH5": return 16963;
        case "SG125": return 52549;
        case "SG40": return 25148;
        case "SG33": return 23271;
        case "SG20": return 18000;
        case "SG17": return 17345;
        case "SG15": return 17135;
        case "SG12": return 14276;
        case "SG10": return 13776;
        case "SG8": return 11840;
        case "SG7": return 11741;
        case "SG6": return 11668;
        case "SG5": return 11405;
        case "Solax 12kW": return 21079;
        case "Emaldo": return 87000;
        case "SH15": return 26253;
        case "SH20": return 29098;
        case "Solis 15": return 17763;
        case "Solis 10": return 15859;
        case "Sigenergy 10": return 21400;
        case "Sigenergy 12": return 25000;
        case "Sigenergy 15": return 27900;
        case "Sigenergy 17": return 29500;
        case "Sigenergy 20": return 31000;
        case "Sigenergy 25": return 36000;
        case "Sigenergy 17": return 29500;
        case "Sigenergy 20": return 31000;
        case "Sigenergy 25": return 36000;
        default: return 0;
    }
}

function getInverter2Price(inverterType) {
    return getInverter1Price(inverterType); // Återanvänd funktionen för samma prislista
}

function getRoofMaterialCost(roofType, numPanels) {
    switch(roofType) {
        case "Tegel/betong":
            return 1846 * numPanels;
        case "Papptak":
            return 2858 * numPanels;
        case "TRP":
            return 1975 * numPanels;
        case "Falsat plåttak":
            return 1973 * numPanels;
        case "Lättviktstak":
            return 2098 * numPanels;
        default:
            return 0;
    }
}

function getExtraRoofPrice(extraRoofs) {
    switch(extraRoofs) {
        case "1st": return 1600;
        case "2st": return 3200;
        case "3st": return 4800;
        case "4st": return 6400;
        case "5st": return 8000;
        default: return 0;
    }
}

function getHorizontalPanelPrice(horizontalPanels, numPanels) {
    if (horizontalPanels === "ja") {
        return numPanels * 80;
    }
    return 0;
}

