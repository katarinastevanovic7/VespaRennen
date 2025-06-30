// src/utils/gpsSender.js

let lastPosition = null;
let lastTimestamp = null;
let smoothedSpeed = null;

const MIN_DISTANCE_KM = 0.003; // 3 Meter
const MAX_SPEED_M_S = 30; // 108 km/h
const SMOOTHING_FACTOR = 0.2;

export function startGps() {
  if ('geolocation' in navigator) {
    console.log("📍 GPS-Tracking gestartet...");

    navigator.geolocation.watchPosition(
      sendPosition,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );
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

function sendPosition(position) {
  const { latitude, longitude, speed } = position.coords;
  const now = Date.now();
  let calcSpeed = speed;

  if ((speed == null || speed === 0) && lastPosition && lastTimestamp) {
    const distKm = getDistanceKm(lastPosition.lat, lastPosition.lon, latitude, longitude);
    const timeSec = (now - lastTimestamp) / 1000;

    // Nur wenn genug Zeit und Strecke vergangen ist
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
  if (calcSpeed != null) {
    smoothedSpeed = smoothedSpeed == null
      ? calcSpeed
      : smoothedSpeed * (1 - SMOOTHING_FACTOR) + calcSpeed * SMOOTHING_FACTOR;
  }

  lastPosition = { lat: latitude, lon: longitude };
  lastTimestamp = now;

  const data = {
    lat: latitude,
    lng: longitude,
    speed: parseFloat((smoothedSpeed || 0).toFixed(2))
  };

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
