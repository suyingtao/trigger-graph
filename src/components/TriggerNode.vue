<template compiler="vugel">
  <container
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
    @mousedown="$emit('moving', id)"
    @mouseup="onMouseup"
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
      :alpha="isMoving || dropable ? 0.5 : 1"
      :line-dash="isHover || isMoving ? [6, 6] : undefined"
      :stroke-width="isActive ? 6 : 4"
      :stroke-color="typing ? 'orange' : isActive ? '#ff3300' : '#0099ff'"
      @setup="setup"
    >
      <text color="black" :font-size="14" :font-weight="400" ref="text">{{
        label
      }}</text>
    </styled-rectangle>
  </container>
</template>

<script lang="ts">
import { computed, ref } from "vue";
import type { Ref } from "vue";

export const isTyping: Ref<boolean> = ref(false);
</script>

<script setup lang="ts">
import { onUnmounted, defineProps, defineEmits } from "vue";
import { Node } from "vugel";
import type { VugelNodeEventListener } from "vugel";
import { getNodeLayout } from "../utils/getNodeLayout";

const props = defineProps<{
  x: number;
  y: number;
  stageX: number;
  stageY: number;
  scale: number;
  id: string;
  movingNodeId?: string;
  label: string;
  isMoving: boolean;
  isActive: boolean;
}>();
const emit = defineEmits<{
  (event: "labelChange", value: string): void;
  (event: "inputBlur"): void;
  (event: "active", id: string): void;
  (event: "moving", id: string): void;
  (event: "drop"): void;
}>();
const setup: VugelNodeEventListener = ({ element, stage }) => {
  element.id = props.id;
};
const isHover = ref(false);

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

const dropable = computed(() => {
  return !!(isHover.value && props.movingNodeId && !props.isMoving);
});

const onMouseup = () => {
  if (!dropable.value) {
    return;
  }
  emit("drop");
};
</script>
