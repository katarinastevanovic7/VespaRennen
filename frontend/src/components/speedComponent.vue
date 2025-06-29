<template>
  <div class="speed-display">
    <span class="speed">{{ speed }}</span>
    <span class="unit">km/h</span>
  </div>
</template>

<script>
export default {
  props: ['speed']
};
</script>
