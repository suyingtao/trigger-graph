<template compiler="vugel">
  <container>
    <drawing ref="drawingRef" :w="width" :h="height" @draw="draw" />
  </container>
</template>

<script setup lang="ts">
import type { Line } from "@/core/Line";
import { Node } from "@/core/Node";
import type { DrawingFunctionOptions } from "tree2d";
import { ref, watch, defineProps } from "vue";
import type { PropType, Ref } from "vue";
import type { Drawing } from "vugel";
import { getStringLength } from "@/utils/getStringLength";
import { useWindowSize } from "@vueuse/core";

const OFFSET_Y = 15;
const OFFSET_X = 8;
const props = defineProps({
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
});
const drawingRef: Ref<Drawing | null> = ref(null);
const { width, height } = useWindowSize();
watch(props, () => {
  if (drawingRef.value) {
    drawingRef.value.update();
  }
});
const draw = (info: DrawingFunctionOptions) => {
  const ctx = info.context;
  ctx.scale(props.scale, props.scale);
  props.lines.forEach((line) => {
    ctx.beginPath();
    ctx.moveTo(line.x + props.stageX, line.y + OFFSET_Y + props.stageY);
    ctx.strokeStyle = "grey";
    ctx.lineWidth = 2;
    const parentNode = props.nodeMap.get(line.parentId);
    if (!parentNode) return {};
    const parentLabelLen = getStringLength(parentNode.label.trim());
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
};
</script>
