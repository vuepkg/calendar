<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = defineProps<{
  options: Array<{ value: string; label: string }>
  modelValue: string
  ariaLabel: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const itemRefs = ref<(HTMLButtonElement | null)[]>([])

function setItemRef(el: Element | null, index: number) {
  itemRefs.value[index] = el as HTMLButtonElement | null
}

async function selectByIndex(index: number) {
  const option = props.options[index]
  if (!option) return
  emit('update:modelValue', option.value)
  await nextTick()
  itemRefs.value[index]?.focus()
}

function onKeydown(event: KeyboardEvent) {
  const total = props.options.length
  const currentIndex = props.options.findIndex((option) => option.value === props.modelValue)
  const baseIndex = currentIndex === -1 ? 0 : currentIndex

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      selectByIndex((baseIndex + 1) % total)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      selectByIndex((baseIndex - 1 + total) % total)
      break
    case 'Home':
      event.preventDefault()
      selectByIndex(0)
      break
    case 'End':
      event.preventDefault()
      selectByIndex(total - 1)
      break
  }
}
</script>

<template>
  <div class="vp-segmented-control" role="group" :aria-label="ariaLabel" @keydown="onKeydown">
    <button
      v-for="(option, index) in options"
      :key="option.value"
      :ref="(el) => setItemRef(el as Element | null, index)"
      type="button"
      class="vp-segmented-control-item"
      :class="{ active: option.value === modelValue }"
      :aria-pressed="option.value === modelValue"
      :tabindex="option.value === modelValue ? 0 : -1"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.vp-segmented-control {
  display: inline-flex;
  border: 1px solid var(--vp-tab-track-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--vp-tab-track-bg);
  padding: 3px;
  gap: 2px;
}

.vp-segmented-control-item {
  border: none;
  background: transparent;
  color: var(--vp-tab-text);
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition:
    background var(--vp-transition-base),
    color var(--vp-transition-base),
    box-shadow var(--vp-transition-base);
  white-space: nowrap;
}

.vp-segmented-control-item:hover:not(.active) {
  background: var(--vp-tab-bg-hover);
  color: var(--vp-tab-text-hover);
}

.vp-segmented-control-item.active {
  background: var(--vp-tab-active-bg);
  color: var(--vp-tab-active-text);
  font-weight: 600;
  box-shadow: var(--vp-tab-active-shadow);
}

.vp-segmented-control-item:focus-visible {
  outline: var(--vp-focus-ring);
  outline-offset: 1px;
}

@media (max-width: 480px) {
  .vp-segmented-control {
    width: 100%;
  }

  .vp-segmented-control-item {
    flex: 1;
    padding: 6px 4px;
    font-size: 11px;
    text-align: center;
  }
}
</style>
