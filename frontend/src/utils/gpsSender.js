let lastPosition = null;
let lastTimestamp = null;
let totalDistance = 0;
let averageSpeed = 0;

export function startGps() {
  if ('geolocation' in navigator) {
    console.log("📍 GPS-Tracking gestartet...");

    setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        sendPosition,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }, 500); // <— schickt alle 500ms neue Position
  } else {
    console.warn("❌ Geolocation nicht verfügbar.");
  }
}


function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Erdradius in km
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
  let deltaDistance = 0;

  // ➤ Geschwindigkeit und Strecke berechnen, falls native Geschwindigkeit fehlt
  if ((speed == null || speed <= 0) && lastPosition && lastTimestamp) {
    const distKm = getDistanceKm(lastPosition.lat, lastPosition.lon, latitude, longitude);
    const timeSec = (now - lastTimestamp) / 1000;

    if (timeSec > 0 && distKm > 0) {
      calcSpeed = (distKm / timeSec) * 1000; // m/s
      deltaDistance = distKm * 1000; // m
    }
  }

  if (lastPosition) {
    const distKm = getDistanceKm(lastPosition.lat, lastPosition.lon, latitude, longitude);
    deltaDistance = distKm * 1000;
    totalDistance += deltaDistance;
  }

  lastPosition = { lat: latitude, lon: longitude };
  lastTimestamp = now;

  // Ø-Geschwindigkeit berechnen
  if (lastTimestamp && totalDistance > 0) {
    const timeElapsedSec = (now - lastTimestamp) / 1000;
    if (timeElapsedSec > 0) {
      averageSpeed = (totalDistance / timeElapsedSec) * 3.6; // in km/h
    }
  }

  const data = {
    latitude,
    longitude,
    speed: parseFloat((calcSpeed || 0).toFixed(2)), // m/s
    distance: parseFloat(totalDistance.toFixed(1)), // m
    averageSpeed: parseFloat(averageSpeed.toFixed(1)) // km/h
  };

  console.log("📤 Sende GPS-Daten:", data);

  fetch('https://vesparennen.onrender.com/api/gps/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.error("❌ Fehler beim Senden:", err));
}

function handleError(error) {
  console.error("❌ GPS-Fehler:", error.message, error);
}
