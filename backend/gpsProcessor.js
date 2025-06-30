// gpsProcessor.js
const turf = require('@turf/turf');

// --- Globale Konfiguration & Zustand ---

const routePoints = [
  [48.71598339320953,12.844524979591371],
  [48.71575700804107,12.844229936599731],
  [48.71567918790413,12.844133377075197],
  [48.71558368120788,12.84406363964081],
  [48.71549701756735,12.844036817550661],
  [48.71541919702824,12.84404754638672],
  [48.71534845097914,12.8440797328949],
  [48.71528124214032,12.844133377075197],
  [48.715228182467314,12.844208478927614],
  [48.715178660055365,12.84430503845215],
  [48.71514682419336,12.844444513320923],
  [48.71514505553377,12.844600081443788],
  [48.7151680481036,12.844736874103548],
  [48.71520518992499,12.844841480255127],
  [48.71529362272265,12.844970226287842],
  [48.71560667357726,12.845380604267122],
  [48.715668576057936,12.845450341701508],
  [48.715741090295566,12.845503985881807],
  [48.71584013396345,12.845530807971956],
  [48.71592149111622,12.845506668090822],
  [48.71601345991305,12.845447659492493],
  [48.716078899146915,12.845364511013031],
  [48.71612842067271,12.845278680324554],
  [48.71616379316127,12.845136523246767],
  [48.716170867656025,12.845010459423067],
  [48.71615671866555,12.844870984554293],
  [48.71612134617201,12.844744920730593],
  [48.71604883248247,12.844626903533936],
  [48.715979855949094,12.844524979591371],
  [48.71598339320953,12.844524979591371]
];

const turfLine = turf.lineString(routePoints.map(p => [p[1], p[0]]));
const COUNTDOWN_MS = 5 * 60 * 1000;
const SMOOTHING_FACTOR = 0.2;
const MAX_SPEED = 70 / 3.6;

let trackingStarted = false;
let firstTrackingTime = null;
let lastUpdateTime = null;
let countdownStart = null;
let countdownRemaining = COUNTDOWN_MS;
let gpsPaused = false;
let pauseTime = null;
let totalPausedTime = 0;

let speedSum = 0;
let speedCount = 0;
let smoothedSpeed = null;
let averageSpeed = 0;
let currentSpeed = null;
let distanceCovered = 0;
let distanceToGoal = 0;
let prevAlong = null;
let totalDistance = 0;
let totalDistanceTravelled = 0;
let lapsCompleted = 0;

const totalLapDistance = turf.length(turfLine, { units: 'meters' });
totalDistance = totalLapDistance;

totalPausedTime = 0;

// --- Hauptfunktion zur Verarbeitung von GPS-Daten ---
function processGpsPosition({ lat, lng, speed }) {
  const now = Date.now();

  if (!trackingStarted) {
    trackingStarted = true;
    firstTrackingTime = now;
    countdownStart = now;
    lastUpdateTime = now;
    distanceCovered = 0;
    distanceToGoal = totalDistance;
    speedSum = 0;
    speedCount = 0;
    smoothedSpeed = null;
    prevAlong = null;
    totalDistanceTravelled = 0;
    lapsCompleted = 0;
  }

  lastUpdateTime = now;
  currentSpeed = typeof speed === 'number' ? speed : null;

  if (currentSpeed !== null) {
    speedSum += currentSpeed;
    speedCount++;
    smoothedSpeed = smoothedSpeed === null
      ? currentSpeed
      : smoothedSpeed * (1 - SMOOTHING_FACTOR) + currentSpeed * SMOOTHING_FACTOR;
  }

  averageSpeed = speedCount > 0 ? speedSum / speedCount : 0;

  const currentPoint = turf.point([lng, lat]);
  const snapped = turf.nearestPointOnLine(turfLine, currentPoint);
  const distanceAlong = snapped.properties.location * 1000;

  if (prevAlong !== null) {
    let diff = distanceAlong - prevAlong;
    if (diff < -totalDistance * 0.5) {
      diff = (totalDistance - prevAlong) + distanceAlong;
      lapsCompleted++;
    }
    if (diff > 0) {
      totalDistanceTravelled += diff;
    }
  }
  prevAlong = distanceAlong;

  distanceCovered = totalDistanceTravelled;
  distanceToGoal = Math.max((lapsCompleted + 1) * totalDistance - distanceCovered, 0);

  const nowMs = Date.now();
  const paused = totalPausedTime + (gpsPaused && pauseTime ? nowMs - pauseTime : 0);
  const remainingTime = COUNTDOWN_MS - (nowMs - countdownStart - paused);

  const baseSpeed = smoothedSpeed !== null
    ? 0.7 * smoothedSpeed + 0.3 * averageSpeed
    : (averageSpeed || 0);

  const lapLength = totalDistance;
  let result = {
    timestamp: now,
    currentSpeed,
    averageSpeed,
    smoothedSpeed,
    distanceCovered,
    distanceToGoal,
    lapsCompleted,
    remainingTime,
    suggestedSpeedLower: null,
    suggestedSpeedUpper: null,
    lapsLower: null,
    lapsUpper: null
  };

  if (remainingTime > 0 && lapLength > 0 && baseSpeed > 0) {
    const predictedLaps = (distanceCovered + baseSpeed * (remainingTime / 1000)) / lapLength;
    let lowerTarget = Math.floor(predictedLaps);
    if (lowerTarget < lapsCompleted) lowerTarget = lapsCompleted;
    const upperTarget = lowerTarget + 1;

    let speedLower = (lowerTarget * lapLength - distanceCovered) / (remainingTime / 1000);
    let speedUpper = (upperTarget * lapLength - distanceCovered) / (remainingTime / 1000);

    if (currentSpeed && speedLower >= currentSpeed) speedLower = currentSpeed * 0.9;
    if (currentSpeed && speedUpper <= currentSpeed) speedUpper = currentSpeed * 1.1;

    const validLower = speedLower > 0 && speedLower <= MAX_SPEED;
    const validUpper = speedUpper > 0 && speedUpper <= MAX_SPEED;

    if (validLower) {
      result.suggestedSpeedLower = speedLower * 3.6;
      result.lapsLower = (distanceCovered + speedLower * (remainingTime / 1000)) / lapLength;
    }
    if (validUpper) {
      result.suggestedSpeedUpper = speedUpper * 3.6;
      result.lapsUpper = (distanceCovered + speedUpper * (remainingTime / 1000)) / lapLength;
    }
  }

  return result;
}

module.exports = { processGpsPosition };
