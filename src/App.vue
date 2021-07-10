<template>
  <vugel
    :settings="{ clearColor: 'null' }"
    style="width: 100%; height: 100%"
    @mousemove="onMousemove"
    @mouseup="onMouseup"
    @mouseleave="onMouseleave"
  >
    <container x="20" y="20" :flex="true" flex-direction="column">
      <text :font-size="14" :font-weight="400" :z-index="100">{{
        "moving node id:" + moveNodeId
      }}</text>
      <text :font-size="14" :font-weight="400" :z-index="100">{{
        "selected node id:" + activeId
      }}</text>
      <text :font-size="14" :font-weight="400">{{ "scale:" + scale }}</text>
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
        <Button @click="onClickLoadData" label="load data" />
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
import {
  computed,
  defineComponent,
  reactive,
  Ref,
  ref,
  unref,
  watch,
} from "vue";
import { Vugel } from "vugel";
import TriggerNode from "./components/TriggerNode.vue";
import Lines from "./components/Lines.vue";
import { testData } from "./mock";
import { genNode, Node, NodeIdGenerator, NODE_ID_PREFIX } from "./core/Node";
import { genLine } from "./core/Line";
import Button from "./components/Button.vue";
import { useDebounceFn, useManualRefHistory } from "@vueuse/core";
const STORAGE_KEY = "__NODES_DATA__";
const OFFSET_X = 150;
const OFFSET_Y = 100;
export default defineComponent({
  name: "App",
  components: { Vugel, TriggerNode, Lines, Button },
  setup() {
    const stageOffset = reactive({
      x: 0,
      y: 0,
    });
    const scale = ref(1);
    const autoLayout = ref(false);
    const nodes: Ref<Node[]> = ref(testData.map(genNode));
    const { commit, undo, redo, canUndo, canRedo, clear, reset } =
      useManualRefHistory(nodes, { clone: true, capacity: 20 });
    const debouncedCommit = useDebounceFn(() => {
      commit();
    }, 300);
    const nodeMap = computed(() => new Map(unref(nodes).map((i) => [i.id, i])));
    const moveNodeId: Ref<string | undefined> = ref();
    const activeId: Ref<string | undefined> = ref();
    const onMousemove = (e: MouseEvent) => {
      const { movementY, movementX } = e;
      if (moveNodeId.value) {
        const node = nodeMap.value.get(moveNodeId.value) as Node;
        node.x += movementX / scale.value;
        node.y += movementY / scale.value;
        return;
      }
      if (e.buttons === 1) {
        stageOffset.x += movementX / scale.value;
        stageOffset.y += movementY / scale.value;
      }
    };

    const layout = (id?: string) => {
      if (!id) return;
      const layoutIds = [id];
      let currId = layoutIds.shift();
      while (currId) {
        const currNode = unref(nodes).find((node) => node.id === currId);
        if (!currNode) return;
        const children = unref(nodes)
          .filter((node) => node.parentId === currId)
          .sort((a, b) => b.y - a.y);
        const count = children.length;
        children.forEach((child, i) => {
          child.x = currNode.x + OFFSET_X;
          child.y = currNode.y + ((count - 1) * OFFSET_Y) / 2 - i * OFFSET_Y;
          layoutIds.push(child.id);
        });
        currId = layoutIds.shift();
      }
    };

    const onMouseup = () => {
      const node = unref(nodes).find((i) => i.id === moveNodeId.value);
      if (node) {
        activeId.value = node.id;
        node.zIndex = 2;
        unref(autoLayout) && layout(node.id);
        debouncedCommit();
      }
      moveNodeId.value = undefined;
    };

    const lines = computed(() => {
      return (
        unref(nodes).filter((node) => node.parentId) as Required<Node>[]
      ).map((node) => {
        const parentNode = nodeMap.value.get(node.parentId) as Node;
        return genLine(node, parentNode);
      });
    });

    const onClickAddChild = () => {
      if (!activeId.value) return;
      const node = nodeMap.value.get(activeId.value) as Node;
      const children = unref(nodes).filter(
        (i) => i.parentId === activeId.value
      );
      const x = (() => {
        if (children.length) {
          return Math.max(...children.map((i) => i.x));
        }
        return node.x + 100;
      })();
      const y = (() => {
        if (children.length) {
          return Math.max(...children.map((i) => i.y)) + 50;
        }
        return node.y - 50;
      })();
      const newNode = genNode({
        x,
        y,
        zIndex: 1,
        parentId: activeId.value,
        label: "new node",
      });
      unref(nodes).push(newNode);
      unref(autoLayout) && layout(node.id);
      debouncedCommit();
    };

    const onClickAddSibling = () => {
      if (!activeId.value) return;
      const node = nodeMap.value.get(activeId.value);
      if (!node?.parentId) {
        return;
      }
      const parentNode = nodeMap.value.get(node.parentId) as Node;
      const children = unref(nodes).filter((i) => i.parentId === parentNode.id);
      const x = (() => {
        if (children.length) {
          return Math.max(...children.map((i) => i.x));
        }
        return node.x + 100;
      })();
      const y = (() => {
        if (children.length) {
          return Math.max(...children.map((i) => i.y)) + 50;
        }
        return node.y - 50;
      })();
      const newNode = genNode({
        x,
        y,
        zIndex: 1,
        parentId: parentNode.id,
        label: "new node",
      });
      unref(nodes).push(newNode);
      unref(autoLayout) && layout(parentNode.id);
      debouncedCommit();
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
      unref(nodes).push(newParentNode);
      unref(autoLayout) && layout(parentId || node.parentId);
      debouncedCommit();
    };

    watch(activeId, (curr, prev) => {
      if (!prev) return;
      const node = unref(nodes).find((i) => i.id === prev);
      if (node) {
        node.zIndex = 1;
      }
    });

    const onClickSaveData = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unref(nodes)));
    };

    const onClickLoadData = () => {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        activeId.value = undefined;
        const nodesData: Node[] = JSON.parse(data);
        const maxId = Math.max(
          ...nodesData.map((node) =>
            Number(node.id.slice(NODE_ID_PREFIX.length))
          )
        );
        NodeIdGenerator.setId(maxId);
        unref(nodes).splice(0, unref(nodes).length, ...nodesData);
        commit();
        reset();
        clear();
      }
    };

    const onClickDel = () => {
      const index = unref(nodes).findIndex((i) => i.id === activeId.value);
      unref(nodes).splice(index, 1);
      const removedIds = [activeId.value];
      while (removedIds.length) {
        const curr = removedIds.shift();
        for (let i = 0; i < unref(nodes).length; i++) {
          if (unref(nodes)[i].parentId === curr) {
            removedIds.push(unref(nodes)[i].id);
            unref(nodes).splice(i, 1);
            i--;
          }
        }
      }
      activeId.value = undefined;
      debouncedCommit();
    };

    return {
      autoLayout,
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
      undo,
      redo,
      canUndo,
      canRedo,
      onClickLayout: () => layout(activeId.value),
    };
  },
});
</script>
