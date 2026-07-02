<script setup lang="ts">
import { computed } from 'vue'
import { Chip } from '@vuepkg/ui'
import type { Schedule } from '@/types/schedule'
import { formatPeriod } from '@/utils/date'

const props = defineProps<{
  schedule: Schedule
  color: string
  backgroundColor: string
  compact?: boolean
  showParticipant?: boolean
}>()

const emit = defineEmits<{
  click: [schedule: Schedule]
}>()

const chipTitle = computed(() => {
  const suffix = [props.schedule.participantName, props.schedule.recurrenceId ? '반복 일정' : null]
    .filter(Boolean)
    .join(', ')
  return suffix ? `${props.schedule.title} (${suffix})` : props.schedule.title
})
</script>

<template>
  <Chip
    class="event-chip"
    :class="{ compact, timed: !schedule.allDay }"
    clickable
    :color="color"
    :background-color="backgroundColor"
    :title="chipTitle"
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
