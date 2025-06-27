<template>
  <div class="target-display" :class="directionClass">
    <span class="value">{{ targetSpeed }}</span>
    <span class="unit">km/h</span>
     <!-- 🆕 Zeige Laps nur wenn übergeben -->
    <div class="laps" v-if="laps !== null && laps !== undefined">
      <small>({{ parseFloat(laps).toFixed(1) }} Runden)</small>
    </div>
  </div>
</template>

<script>
export default {
  props: ['targetSpeed', 'directionClass', 'laps']
};
</script>

