<template compiler="vugel">
  <container
    @mousedown="() => setMoveNodeId(id)"
    @click="() => setActiveId(id)"
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
      :stroke-color="isActive ? '#ff3300' : '#0099ff'"
    >
      <text color="black" :font-size="14" :font-weight="400" ref="text">{{
        label
      }}</text>
    </styled-rectangle>
  </container>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, PropType, Ref, ref } from "vue";
import { Node } from "vugel";
import { getNodeLayout } from "../utils/getNodeLayout";
export default defineComponent({
  props: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    id: { type: String, required: true },
    label: { type: String, default: "empty" },
    isMoving: { type: Boolean, default: false },
    setMoveNodeId: {
      required: true,
      type: Function as PropType<(id: string) => void>,
    },
    isActive: { type: Boolean, default: false },
    setActiveId: {
      required: true,
      type: Function as PropType<(id: string) => void>,
    },
    setLabel: {
      required: true,
      type: Function as PropType<(id: string, label: string) => void>,
    },
  },
  setup(props) {
    let inputEl: HTMLInputElement;
    const text: Ref<Node | undefined> = ref();
    const onDbClick = () => {
      const node = text.value;
      if (!node) return;
      if (!inputEl) {
        inputEl = document.createElement("input");
        inputEl.style.position = "fixed";
        inputEl.style.zIndex = "-1";
        inputEl.style.opacity = "0";
        inputEl.addEventListener("blur", () => {
          inputEl.style.display = "none";
        });
        inputEl.addEventListener("input", (e) => {
          const value = (e.target as HTMLInputElement).value || "";
          props.setLabel(props.id, value);
        });
        document.body.appendChild(inputEl);
      }
      const [x, y] = getNodeLayout(node);
      inputEl.style.left = x + "px";
      inputEl.style.top = y + "px";
      inputEl.style.display = "";
      inputEl.focus();
      props.setActiveId(props.id);
    };
    onUnmounted(() => {
      if (inputEl) {
        document.body.removeChild(inputEl);
      }
    });
    return { onDbClick, text };
  },
});
</script>
