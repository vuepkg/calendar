<script setup lang="ts">
import { Chip } from '@vuepkg/ui'

defineProps<{
  name: string
}>()
</script>

<template>
  <Chip class="holiday-chip" :title="name">
    <span class="holiday-chip-label">{{ name }}</span>
  </Chip>
</template>

<style scoped>
.holiday-chip {
  width: 100%;
  padding: 1px 6px;
  font-size: 10px;
  line-height: calc(var(--month-chip-height, 18px) - 2px);
  min-height: var(--month-chip-height, 18px);
  flex-shrink: 0;
  color: var(--vp-holiday-chip-color);
  background-color: var(--vp-holiday-chip-bg);
}

.holiday-chip-label {
  font-weight: 600;
}
</style>
