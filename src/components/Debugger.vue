<template>
  <teleport to="body">
    <div class="debugger">
      <div class="count">Node count: {{ count }}</div>
      <div class="fps">FPS: {{ fps }}</div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, defineProps, toRefs } from "vue";

const props = defineProps<{ count: number }>();
const count = toRefs(props).count;
const fps = ref(0);
let frame = 0;
let lastTime = Date.now();
function loop() {
  const now = Date.now();
  frame++;
  if (now > 1000 + lastTime) {
    fps.value = Math.round((frame * 1000) / (now - lastTime));
    frame = 0;
    lastTime = now;
  }
  requestAnimationFrame(loop);
}
loop();
</script>

<style scoped>
.debugger {
  position: fixed;
  bottom: 30px;
  left: 20px;
}
</style>
