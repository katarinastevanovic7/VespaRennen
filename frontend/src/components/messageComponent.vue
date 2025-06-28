<template>
  <div v-if="show" class="popup-overlay">
    <div class="popup-box">
      <button class="close-btn" @click="$emit('closeMessage')">×</button>
      <p class="popup-text">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: String,
    show: Boolean
  }
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.popup-box {
  position: relative;
  background-color: white;
  color: black;
  font-size: 20px;
  font-weight: bold;
  padding: 40px 50px;
  border-radius: 20px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);
}

.popup-text {
  font-size: 22px;
  line-height: 1.6;
}

.close-btn {
  position: absolute;
  top: -10px;     /* weiter nach oben */
  right: -10px;   /* weiter nach rechts */
  background: none;
  border: none;
  font-size: 28px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
}
</style>
