<script setup lang="ts">
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
    <button type="button" class="nav-btn today-btn" @click="emit('today')">Today</button>
    <div class="nav-arrows">
      <button
        type="button"
        class="nav-btn"
        :aria-label="prevLabel ?? 'Previous'"
        @click="emit('prev')"
      >
        ‹
      </button>
      <button type="button" class="nav-btn" :aria-label="nextLabel ?? 'Next'" @click="emit('next')">
        ›
      </button>
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
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
  flex-shrink: 0;
}

.nav-btn {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 6px 10px;
}

.today-btn {
  font-weight: 600;
}

.nav-arrows {
  display: flex;
  gap: 4px;
}

.nav-arrows .nav-btn {
  width: 30px;
  padding: 6px 0;
  font-size: 16px;
}

.period-label {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}
</style>
