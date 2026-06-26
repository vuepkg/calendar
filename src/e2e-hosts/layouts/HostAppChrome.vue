<script setup lang="ts">
import CalendarHostCore from '../CalendarHostCore.vue'
</script>

<template>
  <div class="host-app-chrome" data-testid="host-root" data-host-layout="app-chrome">
    <header class="app-header" data-testid="host-header">Enterprise Shell Header</header>
    <main class="app-main" data-testid="host-main">
      <CalendarHostCore />
    </main>
    <footer class="app-footer" data-testid="host-footer">© Demo Footer</footer>
  </div>
</template>

<style scoped>
.host-app-chrome {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #edf2f7;
}

.app-header {
  flex-shrink: 0;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  background: #fff;
  border-bottom: 1px solid #d7dee8;
}

.app-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

.app-main > :deep(.schedule-calendar) {
  flex: 1;
  min-height: 0;
}

.app-footer {
  flex-shrink: 0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #64748b;
  background: #fff;
  border-top: 1px solid #d7dee8;
}
</style>
