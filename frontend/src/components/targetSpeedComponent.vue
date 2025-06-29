<template>
  <div class="target-display" :class="directionClass">
    <div class="speed-line">
      <div class="left">
        <span class="value">{{ targetSpeed }}</span>
        <span class="unit">km/h</span>
      </div>
      <div class="right" v-if="laps !== null && laps !== undefined">
        <span class="laps">{{ parseFloat(laps).toFixed(1) }} R</span>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: ['targetSpeed', 'directionClass', 'laps']
};
</script>

