<template>
  <teleport to="body">
    <div v-if="isTyping" class="typing">You are typing now...</div>
  </teleport>
</template>
<script setup lang="ts">
import { isTyping } from "./TriggerNode.vue";
</script>
<style scoped>
.typing {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 0px 20px;
  background: white;
  color: #333;
  font-size: 18px;
  height: 40px;
  line-height: 40px;
  box-sizing: border-box;
  border-radius: 6px;
  text-align: center;
  border: 1px solid orange;
  display: inline-block;
}
</style>
