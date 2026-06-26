<script setup lang="ts">
import { HOLIDAY_CHIP_BACKGROUND, HOLIDAY_CHIP_COLOR } from '@/constants/calendarView'

defineProps<{
  name: string
}>()
</script>

<template>
  <div
    class="holiday-chip"
    :style="{ color: HOLIDAY_CHIP_COLOR, backgroundColor: HOLIDAY_CHIP_BACKGROUND }"
    :title="name"
  >
    <span class="holiday-chip-label">{{ name }}</span>
  </div>
</template>

<style scoped>
.holiday-chip {
  width: 100%;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 10px;
  line-height: calc(var(--month-chip-height, 18px) - 2px);
  min-height: var(--month-chip-height, 18px);
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}

.holiday-chip-label {
  font-weight: 600;
}
</style>
