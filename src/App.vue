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
        <Button
          @click="scale = Math.min(10, (scale * 10 + 1) / 10)"
          label="+scale"
        />
        <Button
          @click="scale = Math.max(0.1, (scale * 10 - 1) / 10)"
          label="-scale"
        />
        <Button
          @click="onClickAddParent"
          :disable="!activeId"
          label="add parent"
        />
        <Button
          @click="onClickAddSibling"
          :disable="!activeId"
          label="add sibling"
        />
        <Button
          @click="onClickAddChild"
          :disable="!activeId"
          label="add child"
        />
        <Button @click="onClickDel" :disable="!activeId" label="delete" />
        <Button @click="onClickSaveData" label="save data" />
        <Button @click="onClickLoadData" label="load data" />
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
import { computed, defineComponent, reactive, Ref, ref, watch } from "vue";
import { Vugel } from "vugel";
import TriggerNode from "./components/TriggerNode.vue";
import Lines from "./components/Lines.vue";
import { testData } from "./mock";
import { genNode, Node } from "./core/Node";
import { genLine } from "./core/Line";
import Button from "./components/Button.vue";

const testNodes = testData.map(genNode);

export default defineComponent({
  name: "App",
  components: { Vugel, TriggerNode, Lines, Button },
  setup() {
    const stageOffset = reactive({
      x: 0,
      y: 0,
    });
    const scale = ref(1);
    const nodes: Node[] = reactive(testNodes);
    const nodeMap = computed(() => new Map(nodes.map((i) => [i.id, i])));
    const moveNodeId: Ref<string | undefined> = ref();
    const activeId: Ref<string | undefined> = ref();
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
      const node = nodes.find((i) => i.id === moveNodeId.value);
      if (node) {
        activeId.value = node!.id;
        node!.zIndex = 2;
      }
      moveNodeId.value = undefined;
    };
    const lines = computed(() => {
      return nodes
        .filter((node) => node.parentId)
        .map((node) => {
          const parentNode = nodeMap.value.get(node.parentId!);
          return genLine(node, parentNode!);
        });
    });
    const onClickAddChild = () => {
      if (!activeId.value) return;
      const node = nodeMap.value.get(activeId.value);
      const children = nodes.filter((i) => i.parentId === activeId.value);
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
      const newNode = genNode({
        x,
        y,
        zIndex: 1,
        parentId: activeId.value,
        label: "new node",
      });
      nodes.push(newNode);
    };
    const onClickAddSibling = () => {
      if (!activeId.value) return;
      const node = nodeMap.value.get(activeId.value);
      if (!node?.parentId) {
        return;
      }
      const parentNode = nodeMap.value.get(node.parentId);
      const children = nodes.filter((i) => i.parentId === parentNode!.id);
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
      const newNode = genNode({
        x,
        y,
        zIndex: 1,
        parentId: parentNode!.id,
        label: "new node",
      });
      nodes.push(newNode);
    };
    const onClickAddParent = () => {
      if (!activeId.value) return;
      const node = nodeMap.value.get(activeId.value);
      if (!node) return;
      const parentId = node.parentId;
      const newParentNode = genNode({
        x: node.x - 100,
        y: node.y,
        zIndex: 1,
        label: "new node",
      });
      if (parentId) newParentNode.parentId = parentId;
      node.parentId = newParentNode.id;
      nodes.push(newParentNode);
    };

    watch(activeId, (curr, prev) => {
      if (!prev) return;
      const node = nodes.find((i) => i.id === prev);
      if (node) {
        node.zIndex = 1;
      }
    });

    const onClickSaveData = () => {
      localStorage.setItem("__NODES_DATA__", JSON.stringify(nodes));
    };

    const onClickLoadData = () => {
      const data = localStorage.getItem("__NODES_DATA__");
      if (data) {
        const nodesData: Node[] = JSON.parse(data);
        console.log(nodesData);
        nodes.splice(0, nodes.length, ...nodesData);
      }
    };

    const onClickDel = () => {
      const index = nodes.findIndex((i) => i.id === activeId.value);
      nodes.splice(index, 1);
      const removedIds = [activeId.value];
      while (removedIds.length) {
        const curr = removedIds.shift();
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].parentId === curr) {
            removedIds.push(nodes[i].id);
            nodes.splice(i, 1);
            i--;
          }
        }
      }
    };

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
      onClickSaveData,
      onClickLoadData,
      onClickDel,
    };
  },
});
</script>
