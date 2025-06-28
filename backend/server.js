// server.js
const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const cors = require('cors');
const gpsLogic = require('./gpsProcessor');

const app = express();
const port = process.env.PORT || 3000;

let latestData = null;
let targetSpeed = { lower: 0, upper: 0 };

app.use(cors());
app.use(express.json());

// GPS-Daten empfangen
app.post('/api/gps/update', (req, res) => {
  latestData = req.body;
  console.log('Neue GPS-Daten empfangen:', latestData);

  const result = gpsLogic.updateFromFrontend(latestData);
  if (result) {
    targetSpeed.lower = result.lower;
    targetSpeed.upper = result.upper;
    console.log(`Zielgeschwindigkeit: ${targetSpeed.lower} ↓ / ${targetSpeed.upper} ↑ km/h`);
  }

  res.sendStatus(200);
});

// GPS-Daten abrufen
app.get('/api/gps/status', (req, res) => {
  res.json(latestData || {});
});

// Zielgeschwindigkeit abrufen
app.get('/api/target-speed', (req, res) => {
  res.json(targetSpeed);
});

// Statisches Vue-Frontend ausliefern
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Alle anderen Routen auf index.html umleiten
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// HTTP-Server starten
app.listen(port, () => {
  console.log(`Server läuft unter http://localhost:${port}`);
});

// WebSocket-Server (optional)
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('WebSocket: Frontend verbunden');
});
