// server.js
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const { processGpsPosition } = require('./gpsProcessor'); // ⬅️ Importiert

const app = express();
const port = 3000;

// Speicher für berechnete GPS- und Ziel-Daten
let latestData = {
  speed: 0,
  lower: 0,
  upper: 0,
  lapsLower: 0,
  lapsUpper: 0
};

let startTrackingFlag = false;
let pauseTrackingFlag = false;
let resumeTrackingFlag = false;
let resetTrackingFlag = false;
let stopTrackingFlag = false;

// Middleware
app.use(cors());
app.use(express.json());

// Test-Endpunkt
app.get('/', (req, res) => {
  res.send('✅ Backend läuft!');
});

// 📡 GPS-Daten empfangen und verarbeiten
app.post('/api/gps/update', (req, res) => {
  const result = processGpsPosition(req.body);

  if (result) {
    latestData = {
      speed: result.currentSpeed,
      lower: result.suggestedSpeedLower,
      upper: result.suggestedSpeedUpper,
      lapsLower: result.lapsLower,
      lapsUpper: result.lapsUpper
    };

    console.log('📡 Neue GPS-Daten verarbeitet:', latestData);
  }

  res.sendStatus(200);
});

// 📡 Aktuelle Werte abrufen (für Geschwindigkeit etc.)
app.get('/api/gps/status', (req, res) => {
  res.json({ speed: latestData.speed });
});

// 🎯 Zielgeschwindigkeiten + Laps abrufen
app.get('/api/target-speed', (req, res) => {
  const {
    suggestedSpeedLower,
    suggestedSpeedUpper,
    lapsLower,
    lapsUpper
  } = lastTargetData || {};

  res.json({
    lower: suggestedSpeedLower,
    upper: suggestedSpeedUpper,
    lapsLower,
    lapsUpper
  });
});

// 🟢 Start
app.post('/api/start-tracking', (req, res) => {
  startTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/start-tracking', (req, res) => {
  res.json({ start: startTrackingFlag });
  if (startTrackingFlag) startTrackingFlag = false;
});

// ⏸️ Pause
app.post('/api/pause-tracking', (req, res) => {
  pauseTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/pause-tracking', (req, res) => {
  res.json({ pause: pauseTrackingFlag });
  if (pauseTrackingFlag) pauseTrackingFlag = false;
});

// 🔁 Reset
app.post('/api/reset-tracking', (req, res) => {
  resetTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/reset-tracking', (req, res) => {
  res.json({ reset: resetTrackingFlag });
  if (resetTrackingFlag) resetTrackingFlag = false;
});

// 🔴 Stop
app.post('/api/stop-tracking', (req, res) => {
  stopTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/stop-tracking', (req, res) => {
  res.json({ stop: stopTrackingFlag });
  if (stopTrackingFlag) stopTrackingFlag = false;
});

// ▶️ Resume
app.post('/api/resume-tracking', (req, res) => {
  resumeTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/resume-tracking', (req, res) => {
  res.json({ resume: resumeTrackingFlag });
  if (resumeTrackingFlag) resumeTrackingFlag = false;
});

// HTTP-Server starten
app.listen(port, () => {
  console.log(`✅ HTTP-Server läuft unter http://localhost:${port}`);
});

// WebSocket-Server (optional)
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('🌐 WebSocket: Frontend verbunden');
});
