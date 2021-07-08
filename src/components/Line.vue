<template>
  <container :x="-stageX" :y="-stageY">
    <drawing :mount="0" ref="drawingRef" :w="w" :h="h" @draw="draw" />
  </container>
</template>

<script lang="ts">
import { DrawingFunctionOptions } from "tree2d";
import { defineComponent, Ref, ref, watch } from "vue";
import type { Drawing } from "vugel";

const OFFSET_Y = 15;
const OFFSET_X = 50;
export default defineComponent({
  props: {
    stageX: { type: Number, default: 0 },
    stageY: { type: Number, default: 0 },
    scale: { type: Number, default: 0 },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    parentX: { type: Number, default: 0 },
    parentY: { type: Number, default: 0 },
  },
  setup(props) {
    const drawingRef: Ref<Drawing | null> = ref(null);
    watch(props, () => {
      if (drawingRef.value) {
        (drawingRef.value as any).handleResize(
          null as any,
          document.body.clientWidth / props.scale,
          document.body.clientHeight / props.scale
        );
        drawingRef.value.update();
      }
    });
    return {
      drawingRef,
      draw(info: DrawingFunctionOptions) {
        if ((window as any).deb) debugger;
        const ctx = info.context;
        ctx.beginPath();
        ctx.moveTo(props.x, props.y + OFFSET_Y);
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 2;
        ctx.bezierCurveTo(
          props.x,
          props.y + OFFSET_Y,
          props.parentX + OFFSET_X,
          props.y + OFFSET_Y,
          props.parentX + OFFSET_X,
          props.parentY + OFFSET_Y
        );
        ctx.stroke();
        return {};
      },
      w: document.body.clientWidth,
      h: document.body.clientHeight,
    };
  },
});
</script>
