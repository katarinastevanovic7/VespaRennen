const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const { processGpsPosition, setRouteStart } = require('./gpsProcessor');

const app = express();
const port = process.env.PORT || 3000;

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

// --- Middleware ---
app.use(cors());
app.use(express.json());

// 📦 Vue-Frontend statisch ausliefern
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 🔁 Fallback nur für Nicht-API-Routen (damit Vue-Routing funktioniert)
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ✅ Test-Endpunkt
app.get('/api', (req, res) => {
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

// 🎯 Startpunkt neu setzen
app.post('/api/set-start', (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat === 'number' && typeof lng === 'number') {
    setRouteStart(lat, lng);
    console.log(`🎯 Startpunkt neu gesetzt auf (${lat}, ${lng})`);
    res.sendStatus(200);
  } else {
    res.status(400).send('❌ Ungültige Koordinaten');
  }
});

// 🟢 HTTP-Server starten
const server = app.listen(port, () => {
  console.log(`✅ HTTP-Server läuft unter http://localhost:${port}`);
});

// 🌐 WebSocket-Server über denselben Port
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('🌐 WebSocket: Frontend verbunden');
});
