<template>
  <div class="scale-wrapper">
    <div class="app-container text-center text-light">
      <div class="speed-wrapper">

        <!-- Aktuelle Geschwindigkeit -->
        <SpeedComponent :speed="speedDisplay" />

        <hr class="separator" />

        <!-- Zielgeschwindigkeit -->
        <TargetSpeedComponent 
          :arrow="directionArrow" 
          :targetSpeed="targetSpeedDisplay" 
          :directionClass="directionClass" 
        />

        <hr class="separator" />

        <TimerComponent 
          :time="formattedTime"
          :phase="phaseCounter"
          :phaseVisible="time <= 35"
          :running="running"
          @start="start"
          @stop="stop"
          @reset="reset"
        />

        <MessageComponent :message="message" />

      </div>
    </div>
  </div>
</template>

<script>
import SpeedComponent from './components/speedComponent.vue';
import TargetSpeedComponent from './components/targetSpeedComponent.vue';
import TimerComponent from './components/timerComponent.vue';
import MessageComponent from './components/messageComponent.vue';

export default {
  components: {
    SpeedComponent,
    TargetSpeedComponent,
    TimerComponent,
    MessageComponent
  },
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
  mounted() {
    // Holt GPS-Daten vom Backend alle 1 Sekunde
    setInterval(() => {
      fetch('http://localhost:3000/api/gps/status')
        .then(res => res.json())
        .then(data => {
          console.log('📡 GPS-Daten empfangen:', data);
          if (data.speed !== undefined) {
            const speedKmh = data.speed * 3.6;
            this.speedDisplay = speedKmh.toFixed(1);

            const target = 20; // Zielgeschwindigkeit (kannst du später dynamisch machen)
            this.targetSpeedDisplay = `${target} km/h`;

            this.directionArrow =
              speedKmh > target + 1 ? '↓' :
              speedKmh < target - 1 ? '↑' : '•';

            this.directionClass =
              speedKmh > target + 1 ? 'text-danger' :
              speedKmh < target - 1 ? 'text-success' : '';
          }
        });
    }, 1000);
  },
  methods: {
    start() {
      this.message = '';
      this.running = true;
      this.time = 300;

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
/* optionales Styling, falls du was anpassen willst */
</style>
