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

    const beraknadEffekt = parseFloat(document.getElementById('beraknadEffekt').value) || 0;
    const elInkop = parseFloat(document.getElementById('elInkop').value) || 0;
    const elForsaljning = parseFloat(document.getElementById('elForsaljning').value) || 0;
    const egenAnvandning = parseFloat(document.getElementById('egenAnvandning').value) || 0;

    // Beräkna installerad effekt kW baserat på panelsort
    const installedPower = getInstalledPower(panelType, panels);

    // Beräkna batteri kW och tillhörande kostnad
    const batteryKW = getBatteryKW(batteryType);
    const batteryCost = getBatteryCost(batteryKW);

    // Få batteripris baserat på batteristorlek och summera med batterikostnaden
    const batteryPrice = getBatteryPrice(batteryType) + batteryCost;

    // Beräkna pris baserat på installerad effekt
    const powerCost = getPowerCost(installedPower);

    // Få priser för övriga komponenter
    const panelSortPrice = getPanelPrice(panelType);
    const inverter1Price = getInverter1Price(inverter1Type);
    const inverter2Price = getInverter2Price(inverter2Type);
    const roofMaterialCost = getRoofMaterialCost(roofType, panels);
    const chargerPrice = getChargerPrice(chargerQuantity);
    const extraRoofPrice = getExtraRoofPrice(extraRoofType);
    const horizontalPanelPrice = getHorizontalPanelPrice(horizontalPanels, panels);

    // Beräkna fasta kostnader
    const fallskydd = 2500;
    const frakt = 3500;
    const forbrukningsmaterial = 350 * installedPower;
    const elektriker = 8500;
    const arbetskostnad = 400 * panels;

    // Beräkna totalkostnaden för installationen
    const totalBeforeProvision = (panels * panelSortPrice) + inverter1Price + inverter2Price + batteryPrice + roofMaterialCost + chargerPrice + checkwattIncluded + extraRoofPrice + horizontalPanelPrice + loadBalancerPrice + fallskydd + frakt + forbrukningsmaterial + elektriker + arbetskostnad + powerCost;
    const provision = totalBeforeProvision * 0.01 * 1.25;
    const totalCost = totalBeforeProvision + provision;

    // Beräkna pris för anläggning (exkl moms) och övriga kostnader
    const anlaggningPrisExMoms = calculateAnlaggningPrisExMoms(batteryKW, chargerQuantity, loadBalancerPrice);
    const ovrigaKostnader = calculateOvrigaKostnaderSchablon(anlaggningPrisExMoms);
    const pris97 = calculatePris97(anlaggningPrisExMoms);
    const anlaggningPrisInkMoms = calculateAnlaggningPrisInkMoms(anlaggningPrisExMoms);
    const gronRot50 = calculateGronRot50(anlaggningPrisInkMoms);
    const inkopPrisEfterStod = calculateInkopPrisEfterStod(anlaggningPrisInkMoms, gronRot50);

    // Beräkna el som går ut på nätet och andra beräknade värden
    const elUtPaNatet = 100 - egenAnvandning;
    const gronRot194 = gronRot50 * 0.194;
    const inkopPrisEfterStod194 = anlaggningPrisInkMoms - gronRot194;
    const beloppKundBetala = totalCost - gronRot50 - gronRot194;
    const totalPositivEffektAr = (egenAnvandning / 100) * beraknadEffekt * elInkop + (elUtPaNatet / 100) * beraknadEffekt * elForsaljning;
    const totaltBidrag = gronRot50 + gronRot194;

    // Uppdatera HTML med resultaten
    document.getElementById('elUtPaNatet').textContent = elUtPaNatet.toFixed(2);
    document.getElementById('gronRot50').textContent = gronRot50.toFixed(2);
    document.getElementById('inkopPrisEfterStod').textContent = inkopPrisEfterStod.toFixed(2);
    document.getElementById('gronRot194').textContent = gronRot194.toFixed(2);
    document.getElementById('inkopPrisEfterStod194').textContent = inkopPrisEfterStod194.toFixed(2);
    document.getElementById('beloppKundBetala').textContent = beloppKundBetala.toFixed(2);
    document.getElementById('totalPositivEffektAr').textContent = totalPositivEffektAr.toFixed(2);
    document.getElementById('totaltBidrag').textContent = totaltBidrag.toFixed(2);
    document.getElementById('totalCost').textContent = `Total Kostnad: ${totalCost.toFixed(2)} SEK`;
});
