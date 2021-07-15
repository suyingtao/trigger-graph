<template compiler="vugel">
  <styled-rectangle
    :flex="true"
    :flex-grow="0"
    :margin-left="10"
    :padding="8"
    :radius="8"
    :stroke-width="3"
    stroke-color="#000"
    :z-index="100"
    @click="onClick"
    :alpha="disable ? 0.1 : 1"
    cursor-type="pointer"
  >
    <text :font-size="14" :font-weight="400" color="black">{{ label }}</text>
  </styled-rectangle>
</template>

<script setup lang="ts">
import { toRefs } from "@vueuse/core";
import { defineProps, defineEmits, unref, withDefaults } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    disable?: boolean;
  }>(),
  { disable: false, label: "" }
);
const { label, disable } = toRefs(props);
const emit = defineEmits<{
  (event: "click", e: Event): void;
}>();
const onClick = (e: Event) => {
  !unref(disable) && emit("click", e);
};
</script>
