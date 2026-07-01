<script setup lang="ts">
import { Chip } from '@vuepkg/ui'
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
  <Chip
    class="event-chip"
    :class="{ compact, timed: !schedule.allDay }"
    clickable
    :color="color"
    :background-color="backgroundColor"
    :title="
      schedule.recurrenceId
        ? `${schedule.title} (${schedule.participantName}, 반복 일정)`
        : `${schedule.title} (${schedule.participantName})`
    "
    @click="emit('click', schedule)"
  >
    <span class="event-title">
      <span v-if="schedule.recurrenceId" class="event-recurrence-icon" aria-hidden="true">⟳</span
      >{{ schedule.title }}
    </span>
    <span v-if="showParticipant" class="event-participant">{{ schedule.participantName }}</span>
    <span v-if="!compact && !schedule.allDay" class="event-time">
      {{ formatPeriod(schedule.start, schedule.end) }}
    </span>
  </Chip>
</template>

<style scoped>
.event-chip {
  border: 1px solid transparent;
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.3;
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
}

.event-title {
  font-weight: 600;
}

.event-recurrence-icon {
  margin-right: 2px;
  font-weight: 400;
  opacity: var(--vp-chip-text-sub, 0.85);
}

.event-participant,
.event-time {
  font-size: 10px;
  opacity: var(--vp-chip-text-sub, 0.85);
}
</style>
