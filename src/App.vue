<template>
  <vugel
    :settings="{ clearColor: 'null' }"
    style="width: 100%; height: 100%"
    @mousemove="onMousemove"
    @mouseup="onMouseup"
    @mouseleave="onMouseleave"
  >
    <container x="20" y="20" :flex="true" flex-direction="column">
      <text :font-size="14" :font-weight="600" :z-index="100">{{
        "moving node id:" + moveNodeId
      }}</text>
      <text :font-size="14" :font-weight="600" :z-index="100">{{
        "selected node id:" + activeId
      }}</text>
      <text :font-size="14" :font-weight="600">{{ "scale:" + scale }}</text>
      <container :flex="true" :margin-top="10">
        <styled-rectangle
          :flex="true"
          :flex-grow="0"
          :padding="4"
          :radius="8"
          :stroke-width="5"
          stroke-color="#000"
          :z-index="100"
          @click="scale = Math.min(10, (scale * 10 + 1) / 10)"
        >
          <text :font-size="14" :font-weight="600">+scale</text>
        </styled-rectangle>
        <styled-rectangle
          :flex="true"
          :flex-grow="0"
          :padding="4"
          :radius="8"
          :margin-left="10"
          :stroke-width="5"
          stroke-color="#000"
          :z-index="100"
          @click="scale = Math.max(0.1, (scale * 10 - 1) / 10)"
        >
          <text :font-size="14" :font-weight="600">-scale</text>
        </styled-rectangle>
        <styled-rectangle
          :flex="true"
          :flex-grow="0"
          :padding="4"
          :radius="8"
          :margin-left="10"
          :stroke-width="5"
          stroke-color="#000"
          :z-index="100"
          @click="onClickAddParent"
        >
          <text :font-size="14" :font-weight="600">add parent</text>
        </styled-rectangle>
        <styled-rectangle
          :flex="true"
          :flex-grow="0"
          :margin-left="10"
          :padding="4"
          :radius="8"
          :stroke-width="5"
          stroke-color="#000"
          :z-index="100"
          @click="onClickAddSibling"
        >
          <text :font-size="14" :font-weight="600">add sibling</text>
        </styled-rectangle>
        <styled-rectangle
          :flex="true"
          :flex-grow="0"
          :margin-left="10"
          :padding="4"
          :radius="8"
          :stroke-width="5"
          stroke-color="#000"
          :z-index="100"
          @click="onClickAddChild"
        >
          <text :font-size="14" :font-weight="600">add child</text>
        </styled-rectangle>
      </container>
    </container>
    <Lines
      :stageX="stageOffset.x"
      :stageY="stageOffset.y"
      :scale="scale"
      :lines="lines"
    />
    <contaienr
      :x="stageOffset.x * scale"
      :y="stageOffset.y * scale"
      :scale="scale"
    >
      <TriggerNode
        v-for="i in nodes"
        :key="'node:' + i.id"
        v-bind="i"
        :z-index="i.zIndex"
        :is-moving="moveNodeId === i.id"
        :is-active="activeId === i.id"
        :setActiveId="
          (id) => {
            activeId = id;
            i.zIndex = 2;
          }
        "
        :setMoveNodeId="
          (id) => {
            moveNodeId = id;
            i.zIndex = 3;
          }
        "
      />
    </contaienr>
  </vugel>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { Vugel } from "vugel";
import TriggerNode from "./components/TriggerNode.vue";
import Lines from "./components/Lines.vue";
import { testData } from "./mock";

let growthId = 100;
export default defineComponent({
  name: "App",
  components: { Vugel, TriggerNode, Lines },
  setup() {
    const stageOffset = reactive({
      x: 0,
      y: 0,
    });
    const scale = ref(1);
    const nodes = ref(testData);
    const nodeMap = computed(() => new Map(nodes.value.map((i) => [i.id, i])));
    const moveNodeId = ref();
    const activeId = ref();
    const onMousemove = (e: MouseEvent) => {
      const { movementY, movementX } = e;
      if (moveNodeId.value) {
        const node = nodeMap.value.get(moveNodeId.value);
        node!.x += movementX / scale.value;
        node!.y += movementY / scale.value;
        return;
      }
      if (e.buttons === 1) {
        stageOffset.x += movementX / scale.value;
        stageOffset.y += movementY / scale.value;
      }
    };
    const onMouseup = () => {
      const node = nodes.value.find((i) => i.id === moveNodeId.value);
      if (node) {
        activeId.value = node!.id;
        node!.zIndex = 2;
      }
      moveNodeId.value = undefined;
    };
    const lines = computed(() => {
      return nodes.value
        .filter((node) => node.parentId)
        .map((node) => {
          const parentNode = nodeMap.value.get(node.parentId as number);
          return {
            id: node.id,
            parentId: node.parentId,
            x: node.x,
            y: node.y,
            parentX: parentNode!.x,
            parentY: parentNode!.y,
          };
        });
    });
    const onClickAddChild = () => {
      if (!activeId.value) return;
      const node = nodeMap.value.get(activeId.value);
      const children = nodes.value.filter((i) => i.parentId === activeId.value);
      const x = (() => {
        if (children.length) {
          return Math.max(...children.map((i) => i.x));
        }
        return node!.x + 100;
      })();
      const y = (() => {
        if (children.length) {
          return Math.max(...children.map((i) => i.y)) + 50;
        }
        return node!.y - 50;
      })();
      nodes.value.push({
        id: ++growthId,
        x,
        y,
        zIndex: 1,
        parentId: activeId.value,
        label: "new node",
      });
    };
    const onClickAddSibling = () => {
      if (!activeId.value) return;
      const node = nodeMap.value.get(activeId.value);
      if (!node?.parentId) {
        return;
      }
      const parentNode = nodeMap.value.get(node.parentId);
      const children = nodes.value.filter((i) => i.parentId === parentNode!.id);
      const x = (() => {
        if (children.length) {
          return Math.max(...children.map((i) => i.x));
        }
        return node!.x + 100;
      })();
      const y = (() => {
        if (children.length) {
          return Math.max(...children.map((i) => i.y)) + 50;
        }
        return node!.y - 50;
      })();
      nodes.value.push({
        id: ++growthId,
        x,
        y,
        zIndex: 1,
        parentId: parentNode!.id,
        label: "new node",
      });
    };
    const onClickAddParent = () => {
      if (!activeId.value) return;
      const node = nodeMap.value.get(activeId.value);
      if (!node) return;
      const parentId = node.parentId;
      if (!parentId) {
        const newParentNode = {
          id: ++growthId,
          x: node.x - 100,
          y: node.y,
          zIndex: 1,
          label: "new node",
        };
        node.parentId = newParentNode.id;
        nodes.value.push(newParentNode);
        return;
      }

      const newParentNode = {
        id: ++growthId,
        x: node.x - 100,
        y: node.y,
        zIndex: 1,
        label: "new node",
        parentId,
      };
      node.parentId = newParentNode.id;
      nodes.value.push(newParentNode);
    };

    watch(activeId, (curr, prev) => {
      if (!prev) return;
      const node = nodes.value.find((i) => i.id === prev);
      if (node) {
        node.zIndex = 1;
      }
    });

    return {
      stageOffset,
      scale,
      lines,
      nodes,
      moveNodeId,
      activeId,
      onMousemove,
      onMouseup,
      onMouseleave: onMouseup,
      onClickAddChild,
      onClickAddParent,
      onClickAddSibling,
    };
  },
});
</script>
