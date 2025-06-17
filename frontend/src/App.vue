<template>
  <div class="scale-wrapper">
    <div class="app-container text-center text-light">
      <div class="speed-wrapper">
        <div class="speed-display">
          <span class="speed">{{ speedDisplay }}</span>
          <span class="unit">km/h</span>
        </div>

        <hr class="separator" />

        <div class="target-display">
          <span class="arrow">{{ directionArrow }}</span>
          <span :class="directionClass">{{ targetSpeedDisplay }}</span>
        </div>

        <hr class="separator" />

        <div class="timer-container">
          <div class="timer-display">
            <span class="timer">{{ formattedTime }}</span>
          </div>

       <div class="phase-container">
  <span v-if="time <= 35" class="phase-number">{{ phaseCounter }}</span>
</div>

          <div class="button-row">
            <button class="btn btn-warning" @click="start" :disabled="running">Start</button>
            <div class="stop-reset-row">
              <button class="btn btn-danger" @click="stop" :disabled="!running">Stop</button>
              <button class="btn btn-secondary" @click="reset">Reset</button>
            </div>
          </div>

          <div v-if="message" class="popup-message">
  {{ message }}
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
      directionClass: '',
      phaseCounter: 6,
      message: ''
    };
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
      this.message = '';
      this.running = true;
      this.phaseCounter = 6;
      this.time = 60; // 5 Minuten

      this.timerInterval = setInterval(() => {
        if (this.time <= 0) {
          this.message = 'You made it Jörg! 🎉🛵';
          this.stop();
       
          return;
        }

        if (this.time % 30 === 0 && this.phaseCounter > 0) {
          this.phaseCounter--;
        }

        this.time--;

        let speed;
        if (this.time > 240) {
          speed = Math.random() * 10 + 5;
        } else if (this.time > 60) {
          speed = 15 + Math.sin(this.time / 10) * 10 + Math.random() * 5;
        } else {
          speed = 10 + Math.random() * 6;
        }

        speed = Math.min(Math.max(speed, 0), 50);
        this.speedDisplay = speed.toFixed(0);

        const speedMps = speed * 1000 / 3600;
        this.distance += speedMps;

        const targetSpeedKmh = this.time >= 290 ? 30 : 10;
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
      this.phaseCounter = 6;
      this.message = '';
      this.speedDisplay = '--';
      this.targetSpeedDisplay = '--';
      this.directionArrow = '';
      this.directionClass = '';
    }
  }
};
</script>

<style scoped>
/* Deine CSS-Klassen wie .timer-display, .button-row, usw. */
</style>