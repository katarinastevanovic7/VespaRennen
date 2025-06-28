// gpsProcessor.js
let totalDistance = 500; // feste Strecke in Metern (später dynamisch möglich)
let countdownDuration = 5 * 60 * 1000; // 5 Minuten
let countdownStart = Date.now();

let lastSpeed = null;
let lastDistance = 0;

function calculateTargetSpeed(distanceCovered, timestamp) {
  const elapsed = timestamp - countdownStart;
  const remaining = countdownDuration - elapsed;

  if (remaining <= 0 || distanceCovered <= 0) {
    return null;
  }

  const averageSpeed = distanceCovered / (elapsed / 1000); // m/s
  const lapCountEstimate = (averageSpeed * (remaining / 1000)) / totalDistance;

  const lowerTarget = Math.floor(lapCountEstimate);
  const upperTarget = lowerTarget + 1;

  const speedLower = (totalDistance * lowerTarget) / (remaining / 1000);
  const speedUpper = (totalDistance * upperTarget) / (remaining / 1000);

  return {
    lower: (speedLower * 3.6).toFixed(1),
    upper: (speedUpper * 3.6).toFixed(1)
  };
}

function updateFromFrontend(newData) {
  const { speed, distance, timestamp } = newData;

  lastSpeed = speed;
  lastDistance = distance;

  const target = calculateTargetSpeed(distance, timestamp);

  return target;
}

module.exports = {
  updateFromFrontend
};
