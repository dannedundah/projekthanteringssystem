document.getElementById('calculatorForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Förhindrar att formuläret skickas

    // Hämta värden från formuläret
    const panels = parseInt(document.getElementById('panels').value);
    const panelType = document.getElementById('panelSort').value;
    const inverter1Type = document.getElementById('inverter1').value;
    const inverter2Type = document.getElementById('inverter2').value;
    const batteryType = document.getElementById('battery').value;
    const roofType = document.getElementById('roofType').value; // Nytt taktyp
    const chargerIncluded = document.getElementById('charger').checked;
    const checkwattIncluded = document.getElementById('checkwatt').checked;
    const extraRoofType = document.getElementById('extraRoof').value;
    const horizontalPanels = document.getElementById('horizontalPanels').value;
    const loadBalancerIncluded = document.getElementById('loadBalancer').checked;

    // Använd funktionerna för att få priserna
    const panelSortPrice = getPanelPrice(panelType);
    const inverter1Price = getInverter1Price(inverter1Type);
    const inverter2Price = getInverter2Price(inverter2Type);
    const batteryPrice = getBatteryPrice(batteryType);
    const roofMaterialCost = getRoofMaterialCost(roofType, panels); // Beräkna takkostnaden
    const chargerPrice = chargerIncluded ? getChargerPrice() : 0;
    const checkwattPrice = checkwattIncluded ? getCheckwattPrice() : 0;
    const extraRoofPrice = getExtraRoofPrice(extraRoofType);
    const horizontalPanelPrice = getHorizontalPanelPrice(horizontalPanels, panels);
    const loadBalancerPrice = loadBalancerIncluded ? getLoadBalancerPrice("ja") : 0;

    // Beräkna totala kostnaden
    const totalCost = (panels * panelSortPrice) + inverter1Price + inverter2Price + batteryPrice + roofMaterialCost + chargerPrice + checkwattPrice + extraRoofPrice + horizontalPanelPrice + loadBalancerPrice;

    // Visa resultatet
    document.getElementById('totalCost').textContent = `Total Kostnad: ${totalCost} SEK`;
});

// Funktioner för att beräkna priser baserat på användarens val
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
        default: return 0;
    }
}

function getInverter2Price(inverterType) {
    return getInverter1Price(inverterType); // Återanvänd funktionen för samma prislista
}

function getBatteryPrice(batteryType) {
    switch(batteryType) {
        case "SBR096": return 38446;
        case "SBR128": return 49976;
        case "SBR160": return 61506;
        case "SBR192": return 73036;
        case "SBR224": return 84566;
        case "SBR256": return 96096;
        case "Solax 12kW": return 54887;
        case "Pylontech 15kWh": return 52038;
        case "Pylontech 10kWh": return 37170;
        case "Sigenergy 8kWh": return 29721;
        case "Sigenergy 16kWh": return 59442;
        case "Sigenergy 24kWh": return 89163;
        default: return 0;
    }
}

function getChargerPrice() {
    return 7500; // Fast pris
}

function getCheckwattPrice() {
    return 10000; // Fast pris
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

function getLoadBalancerPrice(loadBalancer) {
    if (loadBalancer === "ja") {
        return 3000;
    }
    return 0;
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
