<template compiler="vugel">
  <container
    @mousedown="$emit('moving', id)"
    @click="$emit('active', id)"
    @dblclick="onDbClick"
    cursor-type="move"
  >
    <styled-rectangle
      :x="x"
      :y="y"
      :flex="true"
      :padding="8"
      :radius="8"
      :stroke-width="isActive ? 6 : 4"
      :stroke-color="typing ? 'orange' : isActive ? '#ff3300' : '#0099ff'"
    >
      <text color="black" :font-size="14" :font-weight="400" ref="text">{{
        label
      }}</text>
    </styled-rectangle>
  </container>
</template>

<script lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";

export const isTyping: Ref<boolean> = ref(false);
</script>

<script setup lang="ts">
import { onUnmounted, defineProps, defineEmits } from "vue";
import { Node } from "vugel";
import { getNodeLayout } from "../utils/getNodeLayout";

const props = defineProps<{
  x: number;
  y: number;
  stageX: number;
  stageY: number;
  scale: number;
  id: string;
  label: string;
  isMoving: boolean;
  isActive: boolean;
}>();
const emit = defineEmits<{
  (event: "labelChange", value: string): void;
  (event: "inputBlur"): void;
  (event: "active", id: string): void;
  (event: "moving", id: string): void;
}>();

let inputEl: HTMLInputElement;
const text: Ref<Node | undefined> = ref();
const typing: Ref<boolean> = ref(false);
const onDbClick = () => {
  const node = text.value;
  if (!node) return;
  if (!inputEl) {
    inputEl = document.createElement("input");
    inputEl.style.position = "fixed";
    inputEl.style.zIndex = "-1";
    inputEl.style.width = "100%";
    inputEl.style.opacity = "0";
    inputEl.style.transformOrigin = "left top";
    inputEl.addEventListener("blur", () => {
      typing.value = false;
      isTyping.value = false;
      inputEl.style.display = "none";
      emit("inputBlur");
    });
    inputEl.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value || "";
      emit("labelChange", value);
    });
    document.body.appendChild(inputEl);
  }
  // x = props.stageX * props.scale + props.x + padding
  // y = props.stageY * props.scale + props.y + padding
  const [x, y] = getNodeLayout(node);
  const left = x * props.scale + props.stageX * (1 - props.scale) * props.scale;
  const top = y * props.scale + props.stageY * (1 - props.scale) * props.scale;
  inputEl.style.left = left + "px";
  inputEl.style.top = top + "px";
  inputEl.style.transform = `scale(${props.scale})`;
  inputEl.style.display = "";
  typing.value = true;
  isTyping.value = true;
  inputEl.value = props.label;
  inputEl.focus();
  emit("active", props.id);
};
onUnmounted(() => {
  if (inputEl) {
    document.body.removeChild(inputEl);
  }
});
</script>
