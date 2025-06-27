// server.js
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors'); // falls Frontend auf anderem Port läuft
const app = express();
const port = 3000;

let latestData = null; // ⬅️ Speicher für GPS-Daten

let targetSpeed = { lower: 0,
  upper: 0,
  lapsLower: 0,   // 🆕 hinzufügen!
  lapsUpper: 0    // 🆕 hinzufügen!
};
 //Speicher für Zielgeschwindkeit


app.use(cors());               // optional, aber nützlich für Vue
app.use(express.json());       // damit JSON im Body geparst wird

// Test-Endpunkt
app.get('/', (req, res) => {
  res.send('Backend läuft!');
});

// POST: GPS-Daten empfangen und speichern
app.post('/api/gps/update', (req, res) => {
  latestData = req.body;
  console.log('📡 Neue GPS-Daten empfangen:', latestData);
  res.sendStatus(200);
});

// GET: GPS-Daten abfragen
app.get('/api/gps/status', (req, res) => {
  res.json(latestData || {});
});

// POST: Zielgeschwindigkeiten empfangen
app.post('/api/target-speed', (req, res) => {
  const { lower, upper, lapsLower, lapsUpper } = req.body;


  // Nur die Zahlenwerte ausgeben
  console.log('📥 Zielwerte empfangen:');
  console.log('  Untere Zielgeschwindigkeit:', lower);
  console.log('  Obere Zielgeschwindigkeit:', upper);
  console.log('  Runden-Ziel unten:', lapsLower);
  console.log('  Runden-Ziel oben:', lapsUpper);

   // ➕ Werte im Speicher aktualisieren!
  targetSpeed.lower = lower;
  targetSpeed.upper = upper;
  targetSpeed.lapsLower = lapsLower;   // 🆕 speichern!
  targetSpeed.lapsUpper = lapsUpper;   // 🆕

  res.sendStatus(200);
});

// ⬅️ Diese GET-Route hinzufügen
app.get('/api/target-speed', (req, res) => {
  res.json(targetSpeed);
});


// HTTP-Server starten
app.listen(port, () => {
  console.log(`✅ HTTP-Server läuft unter http://localhost:${port}`);
});

// WebSocket-Server auf Port 8080 (optional, du kannst ihn lassen)
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('🌐 WebSocket: Frontend verbunden');
  
});
