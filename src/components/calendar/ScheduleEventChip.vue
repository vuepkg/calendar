<script setup lang="ts">
import type { Schedule } from '@/types/schedule'
import { formatPeriod } from '@/utils/date'

defineProps<{
  schedule: Schedule
  color: string
  backgroundColor: string
  compact?: boolean
  showParticipant?: boolean
}>()

const emit = defineEmits<{
  click: [schedule: Schedule]
}>()
</script>

<template>
  <div
    class="event-chip"
    :class="{ compact, timed: !schedule.allDay, clickable: true }"
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
    <span v-if="!compact && !schedule.allDay" class="event-time">
      {{ formatPeriod(schedule.start, schedule.end) }}
    </span>
  </div>
</template>

<style scoped>
.event-chip {
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-chip.clickable {
  cursor: pointer;
}

.event-chip.clickable:hover {
  filter: brightness(0.97);
}

.event-chip.compact {
  margin-bottom: 2px;
}

.event-chip.timed {
  height: 100%;
  white-space: normal;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 6px;
  box-sizing: border-box;
}

.event-title {
  font-weight: 600;
}

.event-participant,
.event-time {
  font-size: 10px;
  opacity: 0.85;
}
</style>
