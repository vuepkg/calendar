<script setup lang="ts">
import { ref } from 'vue'
import Button from '../Button.vue'
import Chip from '../Chip.vue'
import IconButton from '../IconButton.vue'
import SegmentedControl from '../SegmentedControl.vue'

const buttonClicks = ref(0)
const chipClicks = ref(0)
const iconButtonClicks = ref(0)

const segmentedOptions = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
]
const segmentedValue = ref('month')
</script>

<template>
  <main class="dev-app">
    <section data-testid="button-section">
      <Button data-testid="button-default" @click="buttonClicks++">Default</Button>
      <Button data-testid="button-bold" weight="bold">Bold</Button>
      <Button data-testid="button-disabled" disabled>Disabled</Button>
      <span data-testid="button-click-count">{{ buttonClicks }}</span>
    </section>

    <section data-testid="icon-button-section">
      <IconButton data-testid="icon-button-md" ariaLabel="Add" @click="iconButtonClicks++">+</IconButton>
      <IconButton data-testid="icon-button-sm" ariaLabel="Remove" size="sm">-</IconButton>
      <IconButton data-testid="icon-button-disabled" ariaLabel="Disabled action" disabled>x</IconButton>
      <span data-testid="icon-button-click-count">{{ iconButtonClicks }}</span>
    </section>

    <section data-testid="chip-section">
      <Chip data-testid="chip-static">Static</Chip>
      <Chip data-testid="chip-clickable" clickable @click="chipClicks++">Clickable</Chip>
      <Chip data-testid="chip-colored" color="rgb(220, 38, 38)" background-color="rgb(254, 226, 226)">
        Colored
      </Chip>
      <span data-testid="chip-click-count">{{ chipClicks }}</span>
    </section>

    <section data-testid="segmented-control-section">
      <SegmentedControl
        v-model="segmentedValue"
        :options="segmentedOptions"
        ariaLabel="Demo view selection"
      />
      <span data-testid="segmented-control-value">{{ segmentedValue }}</span>
    </section>
  </main>
</template>

<style>
.dev-app {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  font-family: sans-serif;
}

.dev-app section {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
