<script setup lang="ts">
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
    <button
      type="button"
      class="calendar-month-nav-btn"
      :aria-label="prevLabel ?? 'Previous month'"
      @click="emit('prev')"
    >
      ‹
    </button>
    <h2 class="calendar-month-nav-title">{{ label }}</h2>
    <button
      type="button"
      class="calendar-month-nav-btn"
      :aria-label="nextLabel ?? 'Next month'"
      @click="emit('next')"
    >
      ›
    </button>
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

.calendar-month-nav-btn {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  border-radius: 4px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  font-size: 18px;
  line-height: 1;
  padding: 0;
}

.calendar-month-nav-btn:hover {
  background: #f8fafc;
}

.calendar-month-nav-title {
  margin: 0;
  min-width: 180px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}
</style>
