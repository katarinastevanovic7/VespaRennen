<template>
  <div class="target-display">
    <span class="arrow">{{ arrow }}</span>
    <span :class="directionClass">{{ targetSpeed }}</span>
  </div>
</template>

<script>
export default {
  props: ['arrow', 'targetSpeed', 'directionClass']
};
</script>
