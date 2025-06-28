// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { updateFromFrontend } = require('./gpsProcessor');
const { updateDistanceAndAvgSpeed } = require('./gpsMath');

const app = express();
const PORT = 3000;

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

app.post('/api/gps/update', (req, res) => {
  const { latitude, longitude, speed } = req.body;
  const timestamp = Date.now();

  // Distanz und Ø-Geschwindigkeit berechnen
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
  const result = updateFromFrontend({ speed: latestGps.speed });
  res.json(result || { lower: null, upper: null });
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
