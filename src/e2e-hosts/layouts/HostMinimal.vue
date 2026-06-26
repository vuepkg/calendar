<script setup lang="ts">
import CalendarHostCore from '../CalendarHostCore.vue'
</script>

<template>
  <div class="host-minimal" data-testid="host-root" data-host-layout="minimal">
    <CalendarHostCore />
  </div>
</template>

<style scoped>
.host-minimal {
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.host-minimal > :deep(.schedule-calendar) {
  flex: 1;
  min-height: 0;
}
</style>
