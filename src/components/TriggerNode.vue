<template>
  <container
    @mousedown="() => setMoveNodeId(id)"
    @click="() => setActiveId(id)"
    @dblclick="onDbClick"
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
      <text :font-size="14" :font-weight="400">{{ label }}</text>
    </styled-rectangle>
  </container>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
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
  },
  setup(props) {
    const onDbClick = () => {
      console.log(1234);
      props.setActiveId(props.id);
    };
    return { onDbClick };
  },
});
</script>
