let lastPosition = null;
let lastTimestamp = null;

export function startGps() {
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(
      sendPosition,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,         // Keine gecachten Daten
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

  // Nur wenn speed null oder 0 ist, berechnen wir manuell
  if ((speed == null || speed === 0) && lastPosition && lastTimestamp) {
    const distKm = getDistanceKm(lastPosition.lat, lastPosition.lon, latitude, longitude);
    const timeSec = (now - lastTimestamp) / 1000;
    if (timeSec > 0 && distKm > 0) {
      calcSpeed = (distKm / timeSec) * 1000; // in m/s
    }
  }

  lastPosition = { lat: latitude, lon: longitude };
  lastTimestamp = now;

  const data = {
    latitude,
    longitude,
    speed: parseFloat((calcSpeed || 0).toFixed(2))
  };

  // 💬 Konsole ausgeben bei jeder Position
  console.log("📡 GPS-Daten gesendet:", data);

  fetch('https://vesparennen.onrender.com/api/gps/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.error("❌ Fehler beim Senden:", err));
}

function handleError(error) {
  console.error("❌ Fehler beim GPS:", error);
}
