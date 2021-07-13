<template compiler="vugel">
  <container>
    <drawing ref="drawingRef" :w="w" :h="h" @draw="draw" />
  </container>
</template>

<script lang="ts">
import { Line } from "@/core/Line";
import { Node } from "@/core/Node";
import { DrawingFunctionOptions } from "tree2d";
import { defineComponent, PropType, Ref, ref, watch } from "vue";
import type { Drawing } from "vugel";

const OFFSET_Y = 15;
const OFFSET_X = 8;

export default defineComponent({
  props: {
    stageX: { type: Number, default: 0 },
    stageY: { type: Number, default: 0 },
    scale: { type: Number, default: 0 },
    lines: {
      type: Array as PropType<Line[]>,
      default: () => [],
    },
    nodeMap: {
      type: Map as PropType<Map<string, Node>>,
      default: () => [],
    },
  },
  setup(props) {
    const drawingRef: Ref<Drawing | null> = ref(null);
    const w = document.body.clientWidth;
    const h = document.body.clientHeight;
    watch(props, () => {
      if (drawingRef.value) {
        drawingRef.value.update();
      }
    });
    return {
      drawingRef,
      draw(info: DrawingFunctionOptions) {
        const ctx = info.context;
        ctx.scale(props.scale, props.scale);
        props.lines.forEach((line) => {
          ctx.beginPath();
          ctx.moveTo(line.x + props.stageX, line.y + OFFSET_Y + props.stageY);
          ctx.strokeStyle = "grey";
          ctx.lineWidth = 2;
          const parentLabelLen = props.nodeMap
            .get(line.parentId)!
            .label.trim().length;
          ctx.bezierCurveTo(
            line.x + props.stageX,
            line.y + OFFSET_Y + props.stageY,
            line.parentX + OFFSET_X + parentLabelLen * 4 + props.stageX,
            line.y + OFFSET_Y + props.stageY,
            line.parentX + OFFSET_X + parentLabelLen * 4 + props.stageX,
            line.parentY + OFFSET_Y + props.stageY
          );
          ctx.stroke();
        });
        return {};
      },
      w,
      h,
    };
  },
});
</script>
