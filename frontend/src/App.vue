<template>
  <div class="scale-wrapper">
    <div class="app-container text-center text-light">
      <!-- Aktuelle Geschwindigkeit -->
      <div class="speed-wrapper">
        <div class="speed-display">
          <span class="speed">{{ speedDisplay }}</span>
          <span class="unit">km/h</span>
        </div>

        <hr class="separator" />

        <!-- Zielgeschwindigkeit & Richtung -->
        <div class="target-display">
          <span class="arrow">{{ directionArrow }}</span>
          <span :class="directionClass">{{ targetSpeedDisplay }}</span>
        </div>

        <hr class="separator" />

        <!-- Timer + Buttons -->
        <div class="timer-container">
          <div class="timer-display">
            <span class="timer">{{ formattedTime }}</span>
          </div>

          <div class="button-row">
            <button class="btn btn-warning" @click="start" :disabled="running">Start</button>
            <div class="stop-reset-row">
              <button class="btn btn-danger" @click="stop" :disabled="!running">Stop</button>
              <button class="btn btn-secondary" @click="reset">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      running: false,
      countdown: 5,
      time: 0,
      distance: 0,
      timerInterval: null,
      speedDisplay: '--',
      targetSpeedDisplay: '--',
      directionArrow: '',
      directionClass: ''
    }
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.time / 60).toString().padStart(2, '0');
      const seconds = (this.time % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    }
  },
  methods: {
    start() {
      this.countdown = 5;
      this.running = true;
      this.distance = 0;

      this.timerInterval = setInterval(() => {
        if (this.countdown > 0) {
          this.speedDisplay = '--';
          this.targetSpeedDisplay = '--';
          this.directionArrow = '';
          this.directionClass = '';
          this.time = this.countdown;
          this.countdown--;
        } else {
          this.time = 0;
          clearInterval(this.timerInterval);
          this.startTimer();
        }
      }, 1000);
    },

    startTimer() {
      const totalTime = 300;

      this.timerInterval = setInterval(() => {
        if (this.time >= totalTime) {
          this.stop();
          return;
        }

        this.time++;

        // Dummy-Geschwindigkeit
        let speed;
        if (this.time < 30) {
          speed = Math.random() * 10 + 5;
        } else if (this.time < 240) {
          speed = 15 + Math.sin(this.time / 10) * 10 + Math.random() * 5;
        } else {
          speed = 10 + Math.random() * 6;
        }

        speed = Math.min(Math.max(speed, 0), 50);
        this.speedDisplay = speed.toFixed(0);

        const speedMps = speed * 1000 / 3600;
        this.distance += speedMps;

        // Zielgeschwindigkeit nur in den ersten 10 Sekunden hoch, dann niedrig
        let targetSpeedKmh = this.time <= 10 ? 30 : 10;

        this.targetSpeedDisplay = `${targetSpeedKmh.toFixed(0)} km/h`;

        if (speed > targetSpeedKmh + 1) {
          this.directionArrow = '↓';
          this.directionClass = 'text-danger';
        } else if (speed < targetSpeedKmh - 1) {
          this.directionArrow = '↑';
          this.directionClass = 'text-success';
        } else {
          this.directionArrow = '•';
          this.directionClass = '';
        }

      }, 1000);
    },

    stop() {
      clearInterval(this.timerInterval);
      this.running = false;
    },

    reset() {
      clearInterval(this.timerInterval);
      this.time = 0;
      this.distance = 0;
      this.running = false;
      this.speedDisplay = '--';
      this.targetSpeedDisplay = '--';
      this.directionArrow = '';
      this.directionClass = '';
    }
  }
}
</script>

<style scoped>
.app-container {
  background-color: black;
  font-family: 'Sarabun', sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100dvh;
  padding-top: 0.5rem;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
}

.speed-display {
  font-size: 120px;
  line-height: 1;
  color: #FFF8E1;
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.unit {
  font-size: 24px;
  margin-left: 8px;
}

.target-display {
  font-size: 24px;
  margin: 1rem 0;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.arrow {
  font-size: 32px;
  margin-right: 0.5rem;
}

.text-danger {
  color: #ff4c4c;
}

.text-success {
  color: #00cc66;
}

.separator {
  height: 1px;
  background-color: #FFF8E1;
  width: 100%;
  margin: 1rem 0;
  border: none;
}

.timer-display {
  background-color: #FFF8E1;
  color: black;
  font-size: 64px;
  padding: 0.5rem 1rem;
  margin: 1.5rem 0;
  border-radius: 16px;
  font-weight: bold;
}

.button-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.stop-reset-row {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

button {
  font-size: 18px;
  padding: 0.6rem 1.2rem;
  min-width: 100px;
  border-radius: 12px;
  font-weight: bold;
}
</style>
