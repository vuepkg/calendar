<script setup lang="ts">
import { IconButton } from '@vuepkg/ui'

defineProps<{
  /** 중앙에 표시할 기간 라벨 (예: `YYYY-MM`) */
  label: string
  prevLabel?: string
  nextLabel?: string
}>()

const emit = defineEmits<{
  prev: []
  next: []
}>()
</script>

<template>
  <div class="calendar-month-nav">
    <IconButton :aria-label="prevLabel ?? 'Previous month'" @click="emit('prev')"> ‹ </IconButton>
    <h2 class="calendar-month-nav-title">{{ label }}</h2>
    <IconButton :aria-label="nextLabel ?? 'Next month'" @click="emit('next')"> › </IconButton>
  </div>
</template>

<style scoped>
.calendar-month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.calendar-month-nav-title {
  margin: 0;
  min-width: 180px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-nav-title-text);
}
</style>
