<template>
  <div class="target-display" :class="directionClass">
    <span class="value">{{ targetSpeed }}</span>
    <span class="unit">km/h</span>
  </div>
</template>

<script>
export default {
  props: ['targetSpeed', 'directionClass']
};
</script>

