let lastPosition = null;
let lastTimestamp = null;

export function startGps() {
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(sendPosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000
    });
  } else {
    console.warn("❌ Geolocation nicht verfügbar.");
  }
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Erdradius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function sendPosition(position) {
  const { latitude, longitude, speed } = position.coords;
  const now = Date.now();

  let calcSpeed = speed;

  // Berechne Geschwindigkeit manuell, wenn nötig
  if ((speed == null || speed === 0) && lastPosition && lastTimestamp) {
    const distKm = getDistanceKm(lastPosition.lat, lastPosition.lon, latitude, longitude);
    const timeSec = (now - lastTimestamp) / 1000;
    if (timeSec > 0) {
      calcSpeed = (distKm / timeSec) * 1000; // in m/s
    }
  }

  lastPosition = { lat: latitude, lon: longitude };
  lastTimestamp = now;

  const data = {
  latitude: latitude,
  longitude: longitude,
  speed: calcSpeed || 0
  };

  console.log("📡 GPS-Daten gesendet:", data);

  //fetch('https://6d90-178-197-239-52.ngrok-free.app/api/gps/update', {
 // fetch('http://localhost:3000/api/gps/update'
 fetch('https://vesparennen.onrender.com/api/gps/update', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(data)
 }).catch(err => console.error("❌ Fehler beim Senden:", err));
}

function handleError(error) {
  console.error("❌ Fehler beim GPS:", error);
}
