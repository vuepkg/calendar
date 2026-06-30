<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel: string
    size?: 'sm' | 'md'
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    size: 'md',
    type: 'button',
  },
)
</script>

<template>
  <button
    :type="type"
    class="vp-icon-button"
    :class="`vp-icon-button--${size}`"
    :aria-label="ariaLabel"
  >
    <slot />
  </button>
</template>

<style scoped>
.vp-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-button-border);
  background: var(--vp-button-bg);
  color: var(--vp-button-text);
  border-radius: var(--vp-button-radius);
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.vp-icon-button:hover {
  background: var(--vp-button-bg-hover);
}

.vp-icon-button:focus-visible {
  outline: var(--vp-focus-ring);
  outline-offset: 1px;
}

.vp-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.vp-icon-button--sm {
  width: 30px;
  height: 30px;
  font-size: 16px;
}

.vp-icon-button--md {
  width: 32px;
  height: 32px;
  font-size: 18px;
}
</style>
