<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    color?: string
    backgroundColor?: string
    clickable?: boolean
  }>(),
  {
    clickable: false,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent]
}>()

const colorStyle = computed(() =>
  props.color || props.backgroundColor
    ? { color: props.color, backgroundColor: props.backgroundColor, borderColor: props.color }
    : undefined,
)

function handleActivate(event: MouseEvent | KeyboardEvent) {
  if (props.clickable) emit('click', event)
}
</script>

<template>
  <div
    class="vp-chip"
    :class="{ 'vp-chip--clickable': clickable }"
    :style="colorStyle"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleActivate"
    @keydown.enter.prevent="handleActivate"
    @keydown.space.prevent="handleActivate"
  >
    <slot />
  </div>
</template>

<style scoped>
.vp-chip {
  box-sizing: border-box;
  border-radius: var(--vp-chip-radius);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-chip--clickable {
  cursor: pointer;
}

.vp-chip--clickable:hover {
  filter: brightness(0.97);
}

.vp-chip--clickable:focus-visible {
  outline: var(--vp-focus-ring);
  outline-offset: 1px;
}
</style>
