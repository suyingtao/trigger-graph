<template>
  <div style="width: 100%; height: 100%">
    <vugel
      :settings="{ clearColor: 'null' }"
      style="width: 100%; height: 100%"
      @mousemove="onMousemove"
      @mouseup="onMouseup"
      @mouseleave="onMouseleave"
    >
      <container x="20" y="20" :flex="true" flex-direction="column">
        <text color="black" :font-size="14" :font-weight="400" :z-index="100">{{
          "moving node id:" + moveNodeId
        }}</text>
        <text color="black" :font-size="14" :font-weight="400" :z-index="100">{{
          "selected node id:" + activeId
        }}</text>
        <text color="black" :font-size="14" :font-weight="400">{{
          "scale:" + scale
        }}</text>
        <container :flex="true" :margin-top="10">
          <Button
            @click="scale = Math.min(10, (scale * 10 + 1) / 10)"
            label="+scale"
          />
          <Button
            @click="scale = Math.max(0.1, (scale * 10 - 1) / 10)"
            label="-scale"
          />
        </container>
        <container :flex="true" :margin-top="10">
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
          <Button @click="onClickLayout" :disable="!activeId" label="layout" />
          <Button
            @click="autoLayout = !autoLayout"
            :label="autoLayout ? 'stop auto layout' : 'start auto layout'"
          />
        </container>
        <container :flex="true" :margin-top="10">
          <Button @click="onClickSaveData" label="save data" />
          <Button @click="onClickLoadData" label="load localStorage data" />
          <Button @click="loadTestData1" label="load test data1" />
          <Button @click="loadTestData2" label="load test data2" />
          <Button @click="loadTestData3" label="load test data3" />
        </container>
        <container :flex="true" :margin-top="10">
          <Button @click="undo" label="undo" :disable="!canUndo" />
          <Button @click="redo" label="redo" :disable="!canRedo" />
        </container>
      </container>
      <Lines
        :stageX="stageOffset.x"
        :stageY="stageOffset.y"
        :scale="scale"
        :lines="lines"
        :nodeMap="nodeMap"
      />
      <container
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
          @active="
            (id) => {
              activeId = id;
              i.zIndex = 2;
            }
          "
          @moving="
            (id) => {
              moveNodeId = id;
              i.zIndex = 3;
            }
          "
          @labelChange="setLabel(i.id, $event)"
          @inputBlur="manualLayout(i.id)"
        />
      </container>
    </vugel>
    <Typing />
    <Debugger :count="nodes.length" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, unref, watch } from "vue";
import type { Ref } from "vue";
import { Vugel } from "vugel";
import TriggerNode from "@/components/TriggerNode.vue";
import Lines from "@/components/Lines.vue";
import { testData, testData2, testData3 } from "./mock";
import {
  genNode,
  Node,
  NodeIdGenerator,
  NODE_ID_PREFIX,
  layout,
  deleteNode,
  addSibling,
  addParent,
  addChild,
} from "@/core/Node";
import { genLine } from "@/core/Line";
import Button from "@/components/Button.vue";
import { useDebounceFn, useManualRefHistory } from "@vueuse/core";
import Debugger from "@/components/Debugger.vue";
import Typing from "@/components/Typing.vue";

const STORAGE_KEY = "__NODES_DATA__";
const stageOffset = reactive({
  x: 0,
  y: 0,
});
const scale = ref(1);
const autoLayout = ref(true);
const nodes: Ref<Node[]> = ref(testData.map(genNode));
const { commit, undo, redo, canUndo, canRedo, clear, reset } =
  useManualRefHistory(nodes, { clone: true, capacity: 20 });
const debouncedCommit = useDebounceFn(() => {
  commit();
}, 300);
const nodeMap = computed(() => new Map(unref(nodes).map((i) => [i.id, i])));
const moveNodeId: Ref<string | undefined> = ref();
const activeId: Ref<string | undefined> = ref();

watch(activeId, (curr, prev) => {
  if (!prev) return;
  const node = unref(nodes).find((i) => i.id === prev);
  if (node) {
    node.zIndex = 1;
  }
});

const lines = computed(() => {
  return (unref(nodes).filter((node) => node.parentId) as Required<Node>[]).map(
    (node) => {
      const parentNode = unref(nodeMap).get(node.parentId) as Node;
      return genLine(node, parentNode);
    }
  );
});

const onMousemove = (e: MouseEvent) => {
  const { movementY, movementX } = e;
  if (moveNodeId.value) {
    const node = unref(nodeMap).get(moveNodeId.value) as Node;
    node.x += movementX / scale.value;
    node.y += movementY / scale.value;
    return;
  }
  if (e.buttons === 1) {
    stageOffset.x += movementX / scale.value;
    stageOffset.y += movementY / scale.value;
  }
};

const onMouseup = () => {
  const node = unref(nodes).find((i) => i.id === moveNodeId.value);
  if (node) {
    activeId.value = node.id;
    node.zIndex = 2;
    unref(autoLayout) && layout(unref(nodes), node.id);
    debouncedCommit();
  }
  moveNodeId.value = undefined;
};
const onMouseleave = onMouseup;

const onClickAddChild = () => {
  const id = unref(activeId);
  if (!id) return;
  addChild(unref(nodes), unref(nodeMap), id);
  unref(autoLayout) && layout(unref(nodes), id);
  debouncedCommit();
};

const onClickAddSibling = () => {
  const id = unref(activeId);
  if (!id) return;
  const [parentNodeId] = addSibling(unref(nodes), unref(nodeMap), id);
  unref(autoLayout) && layout(unref(nodes), parentNodeId);
  debouncedCommit();
};

const onClickAddParent = () => {
  const id = unref(activeId);
  if (!id) return;
  const [oldParentNodeId] = addParent(unref(nodes), unref(nodeMap), id);
  if (!oldParentNodeId) return;
  unref(autoLayout) && layout(unref(nodes), oldParentNodeId);
  debouncedCommit();
};

const onClickSaveData = () =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unref(nodes)));

const loadData = (nodesData: Node[]) => {
  activeId.value = undefined;
  const maxId = Math.max(
    ...nodesData.map((node) => Number(node.id.slice(NODE_ID_PREFIX.length)))
  );
  NodeIdGenerator.setId(maxId);
  unref(nodes).splice(0, unref(nodes).length, ...nodesData);
  commit();
  reset();
  clear();
};

const onClickLoadData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    activeId.value = undefined;
    loadData(JSON.parse(data));
  }
};
const loadTestData1 = () => loadData(testData);
const loadTestData2 = () => loadData(testData2);
const loadTestData3 = () => loadData(testData3);

const onClickDel = () => {
  const id = unref(activeId);
  if (!id) return;
  deleteNode(unref(nodes), id);
  activeId.value = undefined;
  debouncedCommit();
};

const setLabel = (id: string, label: string) => {
  const node = unref(nodeMap).get(id);
  if (!node) return;
  node.label = label;
};

const onClickLayout = () => {
  const id = unref(activeId);
  if (!id) return;
  return layout(unref(nodes), id);
};

const manualLayout = (id: string) => layout(unref(nodes), id);
</script>
