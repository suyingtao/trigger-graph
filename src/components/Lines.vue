<template compiler="vugel">
  <container @setup="setup">
    <drawing ref="drawingRef" :w="width" :h="height" @draw="draw" />
  </container>
</template>

<script setup lang="ts">
import type { Line } from "@/core/Line";
import { Node } from "@/core/Node";
import type { DrawingFunctionOptions } from "tree2d";
import { ref, watch, defineProps } from "vue";
import type { Ref } from "vue";
import type { Drawing } from "vugel";
import { getStringLength } from "@/utils/getStringLength";
import { useWindowSize } from "@vueuse/core";
import type { VugelNodeEventListener } from "vugel";
import type { VugelStage } from "vugel/dist/wrapper";

const stageRef = ref<VugelStage>();

const OFFSET_Y = 15;
const OFFSET_X = 8;
const props = defineProps<{
  stageX: number;
  stageY: number;
  scale: number;
  lines: Line[];
  nodeMap: Map<string, Node>;
}>();
const drawingRef: Ref<Drawing | null> = ref(null);
const setup: VugelNodeEventListener = ({ stage }) => {
  stageRef.value = stage;
};
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
    const node = props.nodeMap.get(line.id);
    const parentNode = props.nodeMap.get(line.parentId);
    if (!parentNode || !node) return {};
    const labelLen = getStringLength(node.label.trim());
    const parentLabelLen = getStringLength(parentNode.label.trim());
    const el = stageRef.value?.getById(line.id);
    const layoutW = el?.core.getLayoutW();
    const layoutH = el?.core.getLayoutH();
    const parentEl = stageRef.value?.getById(line.parentId);
    const parentLayoutW = parentEl?.core.getLayoutW();
    const parentLayoutH = parentEl?.core.getLayoutH();
    const startPoint = {
      x:
        line.x +
        props.stageX +
        (line.parentX > line.x
          ? layoutW
            ? layoutW
            : OFFSET_X + labelLen * 8
          : 0),
      y: line.y + (layoutH ? layoutH / 2 : OFFSET_Y) + props.stageY,
    };
    const endPoint = {
      x:
        line.parentX +
        (parentLayoutW ? parentLayoutW / 2 : OFFSET_X + parentLabelLen * 4) +
        props.stageX,
      y:
        line.parentY +
        (parentLayoutH ? parentLayoutH / 2 : OFFSET_Y) +
        props.stageY,
    };
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.strokeStyle = "grey";
    ctx.lineWidth = 2;
    ctx.bezierCurveTo(
      startPoint.x,
      startPoint.y,
      endPoint.x,
      startPoint.y,
      endPoint.x,
      endPoint.y
    );
    ctx.stroke();
  });
  return {};
};
</script>
