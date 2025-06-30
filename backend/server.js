// server.js
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const { processGpsPosition } = require('./gpsProcessor');

const app = express();
const port = 3000;

// --- Aktueller GPS-Zustand ---
let latestData = {
  speed: 0,
  lower: 0,
  upper: 0,
  lapsLower: 0,
  lapsUpper: 0
};

// --- Steuer-Flags ---
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
    latestData.speed = result.currentSpeed;
    latestData.lower = result.suggestedSpeedLower;
    latestData.upper = result.suggestedSpeedUpper;
    latestData.lapsLower = result.lapsLower;
    latestData.lapsUpper = result.lapsUpper;
    console.log('📡 GPS-Daten aktualisiert:', latestData);
  }
  res.sendStatus(200);
});

// 📡 Aktuelle Geschwindigkeit abrufen
app.get('/api/gps/status', (req, res) => {
  res.json({ speed: latestData.speed });
});

// 🎯 Zielgeschwindigkeiten und Runden abrufen
app.get('/api/target-speed', (req, res) => {
  res.json({
    lower: latestData.lower,
    upper: latestData.upper,
    lapsLower: latestData.lapsLower,
    lapsUpper: latestData.lapsUpper
  });
});

// 🟢 Start
app.post('/api/start-tracking', (req, res) => {
  startTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/start-tracking', (req, res) => {
  res.json({ start: startTrackingFlag });
  startTrackingFlag = false;
});

// ⏸️ Pause
app.post('/api/pause-tracking', (req, res) => {
  pauseTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/pause-tracking', (req, res) => {
  res.json({ pause: pauseTrackingFlag });
  pauseTrackingFlag = false;
});

// 🔁 Reset
app.post('/api/reset-tracking', (req, res) => {
  resetTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/reset-tracking', (req, res) => {
  res.json({ reset: resetTrackingFlag });
  resetTrackingFlag = false;
});

// 🔴 Stop
app.post('/api/stop-tracking', (req, res) => {
  stopTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/stop-tracking', (req, res) => {
  res.json({ stop: stopTrackingFlag });
  stopTrackingFlag = false;
});

// ▶️ Resume
app.post('/api/resume-tracking', (req, res) => {
  resumeTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/resume-tracking', (req, res) => {
  res.json({ resume: resumeTrackingFlag });
  resumeTrackingFlag = false;
});

// HTTP-Server starten
app.listen(port, () => {
  console.log(`✅ HTTP-Server läuft unter http://localhost:${port}`);
});

// WebSocket-Server (optional)
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log(`🌐 WebSocket: Frontend verbunden`);
});