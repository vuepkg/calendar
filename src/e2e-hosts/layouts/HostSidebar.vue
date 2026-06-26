<script setup lang="ts">
import CalendarHostCore from '../CalendarHostCore.vue'
</script>

<template>
  <div class="host-sidebar" data-testid="host-root" data-host-layout="sidebar">
    <aside class="sidebar" aria-label="Application navigation">
      <div class="sidebar-brand">My App</div>
      <nav class="sidebar-nav">
        <span class="nav-item active">Schedule</span>
        <span class="nav-item">Crew</span>
        <span class="nav-item">Reports</span>
      </nav>
    </aside>
    <main class="main" data-testid="host-main">
      <header class="main-header">
        <h1 class="main-title">Schedule Calendar</h1>
      </header>
      <div class="main-content">
        <CalendarHostCore />
      </div>
    </main>
  </div>
</template>

<style scoped>
.host-sidebar {
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: #f1f5f9;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px 12px;
  box-sizing: border-box;
}

.sidebar-brand {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 6px;
}

.nav-item.active {
  background: rgb(255 255 255 / 12%);
}

.main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.main-header {
  flex-shrink: 0;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #d7dee8;
}

.main-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.main-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

.main-content > :deep(.schedule-calendar) {
  flex: 1;
  min-height: 0;
}
</style>
