<template>
  <div class="timer-container">
    <div class="timer-display">
      <span class="timer">{{ time }}</span>
    </div>

    <!-- Phase sichtbar nur wenn übergeben -->
    <div class="phase-container" v-if="phase !== undefined">
      <span class="phase-number">Phase: {{ phase }}</span>
    </div>

    <div class="button-row">
      <button class="btn btn-warning" @click="$emit('start')" :disabled="running">Start</button>
      <div class="stop-reset-row">
        <button class="btn btn-danger" @click="$emit('stop')" :disabled="!running">Stop</button>
        <button class="btn btn-secondary" @click="$emit('reset')">Reset</button>
      </div>
    </div>

    <!-- Pop-up Nachricht -->
    <div v-if="showMessage" class="modal-overlay">
      <div class="modal-box">
        <button class="close-btn" @click="$emit('closeMessage')">×</button>
        <p class="modal-message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    time: String,
    phase: Number,
    running: Boolean,
    message: String,
    showMessage: Boolean
  },
  emits: ['start', 'stop', 'reset', 'pause', 'resume', 'closeMessage']
};
</script>

<style scoped>
/* Optional: Styling für Timer, Pop-up etc. */
</style>
