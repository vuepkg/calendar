<script setup lang="ts">
withDefaults(
  defineProps<{
    weight?: 'normal' | 'bold'
  }>(),
  {
    weight: 'normal',
  },
)
</script>

<template>
  <button type="button" class="vp-button" :class="{ 'vp-button--bold': weight === 'bold' }">
    <slot />
  </button>
</template>

<style scoped>
.vp-button {
  border: 1px solid var(--vp-button-border);
  background: var(--vp-button-bg);
  color: var(--vp-button-text);
  border-radius: var(--vp-button-radius);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 6px 10px;
}

.vp-button:hover {
  background: var(--vp-button-bg-hover);
}

.vp-button:focus-visible {
  outline: var(--vp-focus-ring);
  outline-offset: 1px;
}

.vp-button--bold {
  font-weight: 600;
}
</style>
