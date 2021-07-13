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
    @click="(e) => !disable && $emit('click', e)"
    :alpha="disable ? 0.1 : 1"
  >
    <text :font-size="14" :font-weight="400" color="black">{{ label }}</text>
  </styled-rectangle>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    label: { type: String, default: "" },
    disable: { type: Boolean, default: false },
  },
  emits: ["click"],
});
</script>
