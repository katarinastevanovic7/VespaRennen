<template>
  <div class="scale-wrapper">
    <div class="app-container text-center text-light">
      <div class="speed-row">
        <!-- Zielgeschwindigkeit (langsamer) -->
        <TargetSpeedComponent
          :targetSpeed="targetSpeedUpper"
          directionClass="text-success"
        />
        <!-- Aktuelle Geschwindigkeit -->
        <SpeedComponent :speed="speedDisplay" />
        <!-- Zielgeschwindigkeit (schneller) -->
        <TargetSpeedComponent
          :targetSpeed="targetSpeedLower"
          directionClass="text-danger"
        />
      </div>

      <!-- Timer -->
      <TimerComponent 
        :time="formattedTime"
        :phase="phaseCounter"
        :running="running"
        :message="message"
        :showMessage="showMessage"
        @start="start"
        @stop="stop"
        @reset="reset"
        @pause="pause"
        @resume="resume"
        @closeMessage="showMessage = false"
      />

      <!-- Nachricht -->
      <MessageComponent :message="message" :show="showMessage" @closeMessage="showMessage = false" />

      <!-- 🔽 GPS-Daten direkt anzeigen -->
      <div class="mt-3">
        <p>📍 Latitude: {{ latitude }}</p>
        <p>📍 Longitude: {{ longitude }}</p>
        <p>🚀 Geschwindigkeit: {{ speedDisplay }} km/h</p>
        <p>🛣️ Strecke: {{ totalDistance.toFixed(2) }} m</p>
        <p>⚡ Ø Geschwindigkeit: {{ avgSpeed.toFixed(1) }} km/h</p>
      </div>

    </div>
  </div>
</template>

<script>
import SpeedComponent from './components/speedComponent.vue';
import TargetSpeedComponent from './components/targetSpeedComponent.vue';
import TimerComponent from './components/timerComponent.vue';
import MessageComponent from './components/messageComponent.vue';
import { startGps } from './utils/gpsSender.js';

export default {
  components: {
    SpeedComponent,
    TargetSpeedComponent,
    TimerComponent,
    MessageComponent
  },
  data() {
    return {
      time: 10,
      timerInterval: null,
      running: false,
      paused: false,
      distance: 0,
      speedDisplay: '--',
      directionArrow: '',
      directionClass: '',
      showMessage: false,
      message: '',
      phaseCounter: 5,
      gpsStarted: false,
      targetSpeedLower: null,
      targetSpeedUpper: null,
      // 🔽 Neue Variablen zur Anzeige
      latitude: null,
      longitude: null,
      totalDistance: 0,
      avgSpeed: 0
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.time / 60).toString().padStart(2, '0');
      const seconds = (this.time % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    }
  },
  mounted() {
    setInterval(() => {
      fetch('https://vesparennen.onrender.com/api/gps/status')
        .then(res => res.json())
        .then(data => {
          console.log('📡 GPS-Daten empfangen:', data);
          if (data.speed !== undefined) {
            const speedKmh = data.speed * 3.6;
            this.speedDisplay = speedKmh.toFixed(1);
            this.latitude = data.latitude;
            this.longitude = data.longitude;
            this.totalDistance = data.totalDistance;
            this.avgSpeed = data.avgSpeed * 3.6;
          }
        });

      fetch('https://vesparennen.onrender.com/api/target-speed')
        .then(res => res.json())
        .then(target => {
          if (target.lower !== null && target.upper !== null) {
            this.targetSpeedLower = target.lower;
            this.targetSpeedUpper = target.upper;
          }
        });
    }, 1000);
  },
  methods: {
    start() {
      if (this.running && !this.paused) return;
      this.message = '';
      this.showMessage = false;

      if (this.paused) {
        this.resume();
        return;
      }

      if (!this.gpsStarted) {
        startGps();
        this.gpsStarted = true;
      }

      this.time = 10;
      this.running = true;

      let bufferCountdown = setInterval(() => {
        this.time--;
        if (this.time <= 0) {
          clearInterval(bufferCountdown);
          this.time = 300;
          this.phaseCounter = 5;

          this.timerInterval = setInterval(() => {
            if (this.time <= 0) {
              this.message = 'You made it Jörg! 🎉🛵';
              this.showMessage = true;
              this.stop();
              return;
            }

            if (this.time % 30 === 0 && this.phaseCounter > 0) {
              this.phaseCounter--;
            }

            this.time--;
          }, 1000);
        }
      }, 1000);
    },

    stop() {
      clearInterval(this.timerInterval);
      this.running = false;
      this.paused = true;
    },

    reset() {
      this.stop();
      this.time = 300;
      this.distance = 0;
      this.running = false;
      this.paused = false;
      this.speedDisplay = '--';
      this.directionArrow = '';
      this.directionClass = '';
    },

    pause() {
      if (this.running && !this.paused) {
        clearInterval(this.timerInterval);
        this.paused = true;
        this.running = false;
        this.message = '⏸️ Pausiert';
      }
    },

    resume() {
      if (this.paused) {
        this.running = true;
        this.paused = false;

        this.timerInterval = setInterval(() => {
          if (this.time <= 0) {
            this.message = 'You made it Jörg! 🎉🛵';
            this.showMessage = true;
            this.stop();
            return;
          }

          if (this.time % 30 === 0 && this.phaseCounter > 0) {
            this.phaseCounter--;
          }

          this.time--;
        }, 1000);
      }
    }
  }
};
</script>

<style scoped>
/* optionales Styling */
</style>
