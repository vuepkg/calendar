<script setup lang="ts">
import CalendarHostCore from '../CalendarHostCore.vue'
</script>

<template>
  <div class="host-fixed-panel" data-testid="host-root" data-host-layout="fixed-panel">
    <div class="panel" data-testid="host-panel">
      <p class="panel-label">Dashboard widget (600px)</p>
      <CalendarHostCore />
    </div>
  </div>
</template>

<style scoped>
.host-fixed-panel {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #e2e8f0;
}

.panel {
  width: 100%;
  max-width: 960px;
  height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
}

.panel-label {
  margin: 0;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.panel > :deep(.schedule-calendar) {
  flex: 1;
  min-height: 0;
}
</style>
