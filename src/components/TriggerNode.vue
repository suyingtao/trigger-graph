<template>
  <container @mousedown="onMousedown" @click="onClick">
    <styled-rectangle
      :x="x"
      :y="y"
      :flex="true"
      :padding="8"
      :radius="8"
      :stroke-width="isActive ? 8 : 5"
      :stroke-color="isActive ? '#ff3300' : '#0099ff'"
    >
      <text :font-size="14" :font-weight="600">{{ label }}</text>
    </styled-rectangle>
  </container>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
export default defineComponent({
  props: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    id: { type: Number, default: 0 },
    label: { type: String, default: "empty" },
    isMoving: { type: Boolean, default: false },
    setMoveNodeId: {
      required: true,
      type: Function as PropType<(id: number) => void>,
      default: (id: number) => undefined,
    },
    isActive: { type: Boolean, default: false },
    setActiveId: {
      required: true,
      type: Function as PropType<(id: number) => void>,
      default: (id: number) => undefined,
    },
  },
  setup(props) {
    const onMousedown = () => {
      props.setMoveNodeId(props.id);
    };
    const onClick = () => {
      props.setActiveId(props.id);
    };
    return { onMousedown, onClick };
  },
});
</script>
