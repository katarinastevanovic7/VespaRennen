<template>
  <div v-if="message" class="popup-message">{{ message }}</div>
</template>

<script>
export default {
  props: ['message']
};
</script>
