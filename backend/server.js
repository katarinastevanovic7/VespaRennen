// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { updateFromFrontend } = require('./gpsProcessor');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let latestGps = {
  latitude: null,
  longitude: null,
  speed: 0,
  timestamp: null,
  totalDistance: 0,
  avgSpeed: 0
};

// 📡 GPS-Daten vom Frontend empfangen
app.post('/api/gps/update', (req, res) => {
  const { latitude, longitude, speed } = req.body;

  latestGps.latitude = latitude;
  latestGps.longitude = longitude;
  latestGps.speed = speed;
  latestGps.timestamp = Date.now();

  console.log("📥 Empfangen:", latestGps);
  res.sendStatus(200);
});

// 🛰️ Aktuellen GPS-Status senden
app.get('/api/gps/status', (req, res) => {
  res.json({
    speed: latestGps.speed,
    totalDistance: latestGps.totalDistance,
    avgSpeed: latestGps.avgSpeed
  });
});

// 🎯 Zielgeschwindigkeit berechnen
app.get('/api/target-speed', (req, res) => {
  const result = updateFromFrontend({
    latitude: latestGps.latitude,
    longitude: latestGps.longitude,
    speed: latestGps.speed
  });
  res.json(result || { lower: null, upper: null });
});

// ➕ Frontend bereitstellen
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ➕ SPA-Routing unterstützen
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// 🚀 Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
