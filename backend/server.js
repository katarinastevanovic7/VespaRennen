// server.js
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const app = express();
const port = 3000;

// Speicher für GPS-Daten und Zielwerte
let latestData = null;
let targetSpeed = {
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

// 📡 GPS-Daten empfangen
app.post('/api/gps/update', (req, res) => {
  latestData = req.body;
  console.log('📡 Neue GPS-Daten empfangen:', latestData);
  res.sendStatus(200);
});

// 📡 GPS-Daten abfragen
app.get('/api/gps/status', (req, res) => {
  res.json(latestData || {});
});

// 🎯 Zielgeschwindigkeiten empfangen
app.post('/api/target-speed', (req, res) => {
  const { lower, upper, lapsLower, lapsUpper } = req.body;

  console.log('📥 Zielwerte empfangen:');
  console.log('  Untere Zielgeschwindigkeit:', lower);
  console.log('  Obere Zielgeschwindigkeit:', upper);
  console.log('  Runden-Ziel unten:', lapsLower);
  console.log('  Runden-Ziel oben:', lapsUpper);

  targetSpeed.lower = lower;
  targetSpeed.upper = upper;
  targetSpeed.lapsLower = lapsLower;
  targetSpeed.lapsUpper = lapsUpper;

  res.sendStatus(200);
});

// 🎯 Zielgeschwindigkeiten abrufen
app.get('/api/target-speed', (req, res) => {
  res.json(targetSpeed);
});

// 🚀 Start-Tracking vom Frontend triggern
/*app.post('/api/start-tracking', (req, res) => {
  startTrackingFlag = true;
  console.log('🚀 Tracking wurde vom Frontend getriggert!');
  res.sendStatus(200);
});

// ⏳ Wird regelmäßig vom Tracker-Frontend abgefragt
app.get('/api/start-tracking', (req, res) => {
  res.json({ start: startTrackingFlag });
  if (startTrackingFlag) {
    startTrackingFlag = false; // Nach einer Abfrage zurücksetzen
  }
});*/




// Start
app.post('/api/start-tracking', (req, res) => {
  startTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/start-tracking', (req, res) => {
  res.json({ start: startTrackingFlag });
  if (startTrackingFlag) startTrackingFlag = false;
});

// Pause
app.post('/api/pause-tracking', (req, res) => {
  pauseTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/pause-tracking', (req, res) => {
  res.json({ pause: pauseTrackingFlag });
  if (pauseTrackingFlag) pauseTrackingFlag = false;
});


// Reset
app.post('/api/reset-tracking', (req, res) => {
  resetTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/reset-tracking', (req, res) => {
  res.json({ reset: resetTrackingFlag });
  if (resetTrackingFlag) resetTrackingFlag = false;
});

// Stop
app.post('/api/stop-tracking', (req, res) => {
  stopTrackingFlag = true;
  res.sendStatus(200);
});
app.get('/api/stop-tracking', (req, res) => {
  res.json({ stop: stopTrackingFlag });
  if (stopTrackingFlag) stopTrackingFlag = false;
});

// Resume
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