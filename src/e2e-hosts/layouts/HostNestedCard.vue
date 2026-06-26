<script setup lang="ts">
import { ref } from 'vue'
import CalendarHostCore from '../CalendarHostCore.vue'

const activeTab = ref<'schedule' | 'other'>('schedule')
</script>

<template>
  <div class="host-nested-card" data-testid="host-root" data-host-layout="nested-card">
    <div class="page">
      <div class="tabs" role="tablist" aria-label="Page sections">
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ active: activeTab === 'schedule' }"
          :aria-selected="activeTab === 'schedule'"
          @click="activeTab = 'schedule'"
        >
          Schedule
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ active: activeTab === 'other' }"
          :aria-selected="activeTab === 'other'"
          @click="activeTab = 'other'"
        >
          Other
        </button>
      </div>
      <section
        v-if="activeTab === 'schedule'"
        class="tab-panel"
        role="tabpanel"
        data-testid="host-tab-panel"
      >
        <CalendarHostCore />
      </section>
      <section v-else class="tab-panel placeholder" role="tabpanel">
        Placeholder tab content
      </section>
    </div>
  </div>
</template>

<style scoped>
.host-nested-card {
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
  background: #e2e8f0;
}

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px 0;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.tab {
  border: 1px solid transparent;
  border-bottom: none;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
}

.tab.active {
  background: #fff;
  color: #0f172a;
  border-color: #e2e8f0;
  font-weight: 600;
}

.tab-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

.tab-panel > :deep(.schedule-calendar) {
  flex: 1;
  min-height: 0;
}

.placeholder {
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
}
</style>
