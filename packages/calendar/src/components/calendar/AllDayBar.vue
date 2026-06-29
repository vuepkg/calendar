<script setup lang="ts">
import type { Schedule } from '@/types/schedule'

defineProps<{
  schedule: Schedule
  color: string
  backgroundColor: string
  span: number
  showParticipant?: boolean
}>()

const emit = defineEmits<{
  click: [schedule: Schedule]
}>()
</script>

<template>
  <div
    class="all-day-bar-chip"
    :style="{ color, backgroundColor, borderColor: color }"
    :title="`${schedule.title} (${schedule.participantName})`"
    role="button"
    tabindex="0"
    @click="emit('click', schedule)"
    @keydown.enter.prevent="emit('click', schedule)"
    @keydown.space.prevent="emit('click', schedule)"
  >
    <span class="event-title">{{ schedule.title }}</span>
    <span v-if="showParticipant" class="event-participant">{{ schedule.participantName }}</span>
  </div>
</template>

<style scoped>
.all-day-bar-chip {
  height: 100%;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  cursor: pointer;
}

.all-day-bar-chip:hover {
  filter: brightness(0.97);
}

.event-title {
  font-weight: 600;
}

.event-participant {
  margin-left: 6px;
  font-size: 10px;
  opacity: 0.85;
}
</style>
