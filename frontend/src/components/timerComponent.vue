<template>
  <div class="timer-container">
    <div class="timer-display">
      <span class="timer">{{ time }}</span>
    </div>

    <div class="phase-container" v-show="phaseVisible">
      <span class="phase-number">{{ phase }}</span>
    </div>

    <div class="button-row">
      <button class="btn btn-warning" @click="$emit('start')" :disabled="running">Start</button>
      <div class="stop-reset-row">
        <button class="btn btn-secondary" @click="$emit('reset')">Reset</button>
      </div>
    </div>
  </div>
  


</template>

<script>
export default {
  props: ['time', 'phase', 'phaseVisible', 'running'],
    emits: ['start', 'reset', 'resume', 'reset']

};
</script>
