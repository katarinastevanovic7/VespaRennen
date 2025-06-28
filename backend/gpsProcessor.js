// gpsProcessor.js

let startLat = null;
let startLon = null;
let totalDistance = 0;
let totalTime = 0;
let lastTimestamp = null;

function updateFromFrontend(data) {
  const { latitude, longitude, speed } = data;
  const now = Date.now();

  if (latitude == null || longitude == null) return null;

  if (startLat === null || startLon === null) {
    startLat = latitude;
    startLon = longitude;
    lastTimestamp = now;
    return null;
  }

  const dt = (now - lastTimestamp) / 1000;
  lastTimestamp = now;

  const distance = getDistanceKm(startLat, startLon, latitude, longitude);
  totalDistance += distance * 1000; // in Meter
  totalTime += dt;

  // Zielgeschwindigkeit ±10 %
  const targetSpeed = speed || (totalDistance / totalTime) || 0;
  const suggestedSpeedLower = (targetSpeed * 0.9 * 3.6).toFixed(1);
  const suggestedSpeedUpper = (targetSpeed * 1.1 * 3.6).toFixed(1);

  return {
    lower: suggestedSpeedLower,
    upper: suggestedSpeedUpper,
    distance: totalDistance.toFixed(1),
    averageSpeed: ((totalDistance / totalTime) * 3.6).toFixed(1), // in km/h
  };
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

module.exports = {
  updateFromFrontend
};
