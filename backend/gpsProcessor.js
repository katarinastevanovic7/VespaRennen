// gpsProcessor.js

function updateFromFrontend(data) {
  const { speed } = data;

  if (speed == null || speed <= 0) {
    return null;
  }

  // Zielgeschwindigkeit ±10 %
  const suggestedSpeedLower = (speed * 0.9 * 3.6).toFixed(1); // in km/h
  const suggestedSpeedUpper = (speed * 1.1 * 3.6).toFixed(1); // in km/h

  return {
    lower: suggestedSpeedLower,
    upper: suggestedSpeedUpper
  };
}

module.exports = {
  updateFromFrontend
};
