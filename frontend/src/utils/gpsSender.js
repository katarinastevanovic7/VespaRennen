// src/utils/gpsSender.js

let lastPosition = null;
let lastTimestamp = null;
let smoothedSpeed = null;

const MIN_DISTANCE_KM = 0.003; // 3 Meter
const MAX_SPEED_M_S = 30; // 108 km/h
const SMOOTHING_FACTOR = 0.2;
const SEND_INTERVAL_MS = 400; // 🔁 alle 400ms auch bei Stillstand senden

export function startGps() {
  if ('geolocation' in navigator) {
    console.log("📍 GPS-Tracking gestartet...");

    // Startet kontinuierliches Geotracking
    navigator.geolocation.watchPosition(
      position => {
        updatePosition(position);
        // Kein direktes Senden hier – sendInterval kümmert sich darum
      },
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    // 🔁 Sendet alle 400ms die letzte bekannte Position (auch wenn man stillsteht)
    setInterval(() => {
      if (lastPosition) {
        sendToBackend(lastPosition);
      }
    }, SEND_INTERVAL_MS);

  } else {
    console.warn("❌ Geolocation nicht verfügbar.");
  }
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function updatePosition(position) {
  const { latitude, longitude, speed } = position.coords;
  const now = Date.now();
  let calcSpeed = speed;

  if ((speed == null || speed === 0) && lastPosition && lastTimestamp) {
    const distKm = getDistanceKm(lastPosition.lat, lastPosition.lon, latitude, longitude);
    const timeSec = (now - lastTimestamp) / 1000;

    if (timeSec >= 2 && distKm >= MIN_DISTANCE_KM) {
      const rawSpeed = (distKm / timeSec) * 1000; // m/s

      if (rawSpeed < MAX_SPEED_M_S) {
        calcSpeed = rawSpeed;
      } else {
        console.warn("🚫 Unrealistische Geschwindigkeit ignoriert:", rawSpeed);
        calcSpeed = 0;
      }
    } else {
      calcSpeed = 0;
    }
  }

  // Glättung
  if (typeof calcSpeed === 'number' && calcSpeed >= 0.3 && calcSpeed < MAX_SPEED_M_S) {
    smoothedSpeed = smoothedSpeed == null
      ? calcSpeed
      : smoothedSpeed * (1 - SMOOTHING_FACTOR) + calcSpeed * SMOOTHING_FACTOR;
  } else {
    smoothedSpeed = 0;
  }

  lastPosition = {
    lat: latitude,
    lng: longitude,
    speed: parseFloat((smoothedSpeed || 0).toFixed(2))
  };
  lastTimestamp = now;
}

function sendToBackend(data) {
  console.log("📡 Sende GPS-Daten an Backend:", data);

  fetch('http://localhost:3000/api/gps/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.error("❌ Fehler beim Senden:", err));
}

function handleError(error) {
  console.error("❌ GPS-Fehler:", error.message, error);
}
