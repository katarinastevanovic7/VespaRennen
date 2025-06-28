// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { updateFromFrontend, updateDistanceAndAvgSpeed } = require('./gpsProcessor');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// GPS-Daten-Status
let latestGps = {
  latitude: null,
  longitude: null,
  speed: 0,
  timestamp: null,
  totalDistance: 0,
  avgSpeed: 0
};

app.post('/api/gps/update', (req, res) => {
  const { latitude, longitude, speed } = req.body;
  const timestamp = Date.now();

  const result = updateDistanceAndAvgSpeed(
    latitude,
    longitude,
    speed,
    latestGps.latitude,
    latestGps.longitude,
    latestGps.timestamp,
    latestGps.totalDistance,
    timestamp
  );

  latestGps = {
    latitude,
    longitude,
    speed,
    timestamp,
    totalDistance: result.totalDistance,
    avgSpeed: result.avgSpeed
  };

  console.log("📥 Empfangen:", latestGps);
  res.sendStatus(200);
});

app.get('/api/gps/status', (req, res) => {
  res.json({
    speed: latestGps.speed,
    totalDistance: latestGps.totalDistance,
    avgSpeed: latestGps.avgSpeed
  });
});

app.get('/api/target-speed', (req, res) => {
  const result = updateFromFrontend({
    latitude: latestGps.latitude,
    longitude: latestGps.longitude,
    speed: latestGps.speed
  });
  res.json(result || { lower: null, upper: null });
});

// 📦 Statische Dateien aus dem Frontend-Build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ⛑️ Fallback für SPA (Single Page App)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// 🔊 Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
