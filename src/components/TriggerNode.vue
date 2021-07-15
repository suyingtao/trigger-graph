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
export const isTyping: Ref<boolean> = ref(false);
</script>

<script setup lang="ts">
import { onUnmounted, ref, defineProps, defineEmits, toRefs, unref } from "vue";
import type { Ref } from "vue";
import { Node } from "vugel";
import { getNodeLayout } from "../utils/getNodeLayout";

const props = defineProps({
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  id: { type: String, required: true },
  label: { type: String, default: "empty" },
  isMoving: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
});
const id = toRefs(props).id;
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
    inputEl.style.opacity = "0";
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
  const [x, y] = getNodeLayout(node);
  inputEl.style.left = x + "px";
  inputEl.style.top = y + "px";
  inputEl.style.display = "";
  typing.value = true;
  isTyping.value = true;
  inputEl.value = props.label;
  inputEl.focus();
  emit("active", unref(id));
};
onUnmounted(() => {
  if (inputEl) {
    document.body.removeChild(inputEl);
  }
});
</script>
