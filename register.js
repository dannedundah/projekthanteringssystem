<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projekthanteringssystem</title>
    <link rel="stylesheet" href="style.css">
    <script type="module" src="firebase-config.js"></script>
    <script type="module" src="index.js"></script>
</head>
<body>
    <div class="container">
        <h1>Projekthanteringssystem</h1>
        <button onclick="navigateTo('läggatillprojekt.html')">Lägg till nytt projekt</button>
        <button onclick="navigateTo('planering.html')">Planering</button>
        <button onclick="navigateTo('se-schema.html')">Se mitt schema</button>
        <button onclick="navigateTo('status.html')">Status</button>
    </div>
    <script>
        function navigateTo(page) {
            window.location.href = page;
        }
    </script>
</body>
</html>
