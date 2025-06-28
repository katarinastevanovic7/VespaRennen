let lastPosition = null;
let lastTimestamp = null;

export function startGps() {
  if ('geolocation' in navigator) {
    console.log("📍 GPS-Tracking gestartet...");

    navigator.geolocation.watchPosition(
      sendPosition,
      handleError,
      {
        enableHighAccuracy: true,  // Beste Genauigkeit
        maximumAge: 0,             // Keine alten Daten verwenden
        timeout: Infinity          // Kein Zeitlimit
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

  // Fallback-Berechnung der Geschwindigkeit
  if ((speed == null || speed === 0) && lastPosition && lastTimestamp) {
    const distKm = getDistanceKm(lastPosition.lat, lastPosition.lon, latitude, longitude);
    const timeSec = (now - lastTimestamp) / 1000;

    if (timeSec > 0 && distKm > 0) {
      calcSpeed = (distKm / timeSec) * 1000; // Geschwindigkeit in m/s
    }
  }

  lastPosition = { lat: latitude, lon: longitude };
  lastTimestamp = now;

  const data = {
    latitude: latitude,
    longitude: longitude,
    speed: parseFloat((calcSpeed || 0).toFixed(2))
  };

  console.log("📡 GPS-Daten gesendet:", data);

  fetch('https://vesparennen.onrender.com/api/gps/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.error("❌ Fehler beim Senden:", err));
}

function handleError(error) {
  console.error("❌ GPS-Fehler:", error.message, error);
}
