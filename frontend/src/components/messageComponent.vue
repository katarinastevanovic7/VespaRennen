<template>
  <div v-if="showMessage" class="popup-overlay">
    <div class="popup-box">
      <button class="close-btn" @click="$emit('closeMessage')">×</button>
      <p class="popup-message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ['message', 'showMessage'],
  emits: ['closeMessage']
};
</script>