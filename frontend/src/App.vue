<template>
  <div class="scale-wrapper">
    <div class="app-container text-center text-light">
      <div class="speed-row">
        <!-- Zielgeschwindigkeit (langsam) -->
        <TargetSpeedComponent
          :targetSpeed="targetSpeedUpper"
          directionClass="text-success"
        />
        <!-- Aktuelle Geschwindigkeit -->
        <SpeedComponent :speed="speedDisplay" />
        <!-- Zielgeschwindigkeit (schnell) -->
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

      <MessageComponent :message="message" :show="showMessage" @closeMessage="showMessage = false" />

      <!-- GPS-Debug-Ausgabe für Handytest -->
      <div class="mt-4" style="color: white;">
        <p>📍 Latitude: <span id="lat">?</span></p>
        <p>📍 Longitude: <span id="lon">?</span></p>
        <p>🚀 Native Speed (m/s): <span id="nativeSpeed">?</span></p>
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
      targetSpeedUpper: null
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
    // Backend-GPS-Daten holen
    setInterval(() => {
      fetch('http://localhost:3000/api/gps/status')
        .then(res => res.json())
        .then(data => {
          console.log('📡 GPS-Daten empfangen:', data);
          if (data.speed !== undefined) {
            const speedKmh = data.speed * 3.6;
            this.speedDisplay = speedKmh.toFixed(1);
          }
        });

      // Zielgeschwindigkeit vom Server holen
      fetch('http://localhost:3000/api/target-speed')
        .then(res => res.json())
        .then(target => {
          if (target.lower !== null && target.upper !== null) {
            this.targetSpeedLower = target.lower;
            this.targetSpeedUpper = target.upper;
          }
        });
    }, 400);

    // Native GPS-Daten direkt vom Handy anzeigen (zum Testen)
    navigator.geolocation.watchPosition(
      (pos) => {
        document.getElementById("lat").textContent = pos.coords.latitude.toFixed(6);
        document.getElementById("lon").textContent = pos.coords.longitude.toFixed(6);
        document.getElementById("nativeSpeed").textContent = (pos.coords.speed || 0).toFixed(2);
      },
      (err) => {
        console.error("⚠️ GPS-Fehler", err);
      },
      { enableHighAccuracy: true }
    );
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
/* Optional: weitere Styles */
</style>
