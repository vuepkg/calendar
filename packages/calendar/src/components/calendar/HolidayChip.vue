<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <div class="holiday-chip" :title="name">
    <span class="holiday-chip-label">{{ name }}</span>
  </div>
</template>

<style scoped>
.holiday-chip {
  width: 100%;
  border-radius: var(--vp-chip-radius);
  padding: 1px 6px;
  font-size: 10px;
  line-height: calc(var(--month-chip-height, 18px) - 2px);
  min-height: var(--month-chip-height, 18px);
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  color: var(--vp-holiday-chip-color);
  background-color: var(--vp-holiday-chip-bg);
}

.holiday-chip-label {
  font-weight: 600;
}
</style>
