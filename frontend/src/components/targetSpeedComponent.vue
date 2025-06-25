

<template>
  <div class="target-display" :class="directionClass">
    <span class="value">{{ targetSpeed }}</span>
    <span class="unit">km/h</span>
    <div class="suggested-laps" v-if="laps">
      <small>({{ laps }} Laps)</small>
    </div>
  </div>
</template>

<script>
export default {
  props: ['targetSpeed', 'directionClass', 'laps']
};
</script>

