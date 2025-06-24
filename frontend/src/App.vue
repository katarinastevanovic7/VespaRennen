<template>
  <div class="scale-wrapper">
    <div class="app-container text-center text-light">
      <div class="speed-wrapper">
        <SpeedComponent :speed="speedDisplay" />
        <hr class="separator" />
        <TargetSpeedComponent 
          :arrow="directionArrow" 
          :targetSpeed="targetSpeedDisplay" 
          :directionClass="directionClass" 
        />
        <hr class="separator" />
        <TimerComponent 
          :time="formattedTime"
          @start="start"
          @stop="stop"
          @reset="reset"
          @pause="pause"
          @resume="resume"
        />
        <MessageComponent 
          :message="message" 
          :showMessage="showMessage"
          @closeMessage="showMessage = false"
        />
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
      time: 10,
      timerInterval: null,
      running: false,
      paused: false,
      distance: 0,
      speedDisplay: '--',
      targetSpeedDisplay: '--',
      directionArrow: '',
      directionClass: '',
      showMessage: false,
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
    setInterval(() => {
      fetch('http://localhost:3000/api/gps/status')
        .then(res => res.json())
        .then(data => {
          console.log('📡 GPS-Daten empfangen:', data);
          if (data.speed !== undefined) {
            const speedKmh = data.speed * 3.6;
            this.speedDisplay = speedKmh.toFixed(1);

            const target = 20;
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
      this.showMessage = false;
      this.running = true;
      this.paused = false;

      if (this.time === 0) {
        this.time = 300;
      }

      this.timerInterval = setInterval(() => {
        if (this.time <= 0) {
          this.message = 'You made it Jörg! 🎉🛵';
          this.showMessage = true; 
          this.stop();
          return;
        }
        this.time--;
      }, 1000);
    },

    stop() {
      clearInterval(this.timerInterval);
      this.running = false;
    },

    reset() {
      this.stop();
      this.time = 300;
      this.distance = 0;
      this.running = false;
      this.paused = false;
      this.speedDisplay = '--';
      this.targetSpeedDisplay = '--';
      this.directionArrow = '';
      this.directionClass = '';
    },

    pause() {
      if (this.running && !this.paused) {
        clearInterval(this.timerInterval);
        this.paused = true;
        this.running = false;
        this.message = '⏸️ Pausiert';
        this.showMessage = true;
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