<script setup lang="ts">
import { Button, IconButton } from '@vuepkg/ui'

defineProps<{
  prevLabel?: string
  nextLabel?: string
  /** ‹ › 화살표 오른쪽에 표시할 기간 라벨 (Week: 년월, Day: 년월일) */
  periodLabel?: string
}>()

const emit = defineEmits<{
  today: []
  prev: []
  next: []
}>()
</script>

<template>
  <div class="period-nav">
    <Button weight="bold" @click="emit('today')">Today</Button>
    <div class="nav-arrows">
      <IconButton size="sm" :ariaLabel="prevLabel ?? 'Previous'" @click="emit('prev')">
        ‹
      </IconButton>
      <IconButton size="sm" :ariaLabel="nextLabel ?? 'Next'" @click="emit('next')"> › </IconButton>
    </div>
    <span v-if="periodLabel" class="period-label">{{ periodLabel }}</span>
  </div>
</template>

<style scoped>
.period-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--vp-grid-line);
  background: var(--vp-color-bg);
  flex-shrink: 0;
}

.nav-arrows {
  display: flex;
  gap: 4px;
}

.period-label {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-color-text);
  white-space: nowrap;
}
</style>
