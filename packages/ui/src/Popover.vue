<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import {
  computePopoverLayout,
  computePopoverMaxSize,
  POPOVER_LAYOUT_DEFAULTS,
  resolvePopoverBounds,
  type RectBounds,
} from '@vuepkg/core'

const props = defineProps<{
  open: boolean
  anchorTop: number
  anchorLeft: number
  anchorBottom?: number
  containerBounds?: RectBounds | null
  ariaLabel: string
  panelClass?: string | string[] | Record<string, boolean>
  preferredWidth?: number
  preferredMaxHeight?: number
  minWidth?: number
  minHeight?: number
  containerHeightRatio?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref({
  top: '0px',
  left: '0px',
  maxWidth: `${POPOVER_LAYOUT_DEFAULTS.preferredWidth}px`,
  maxHeight: `${POPOVER_LAYOUT_DEFAULTS.preferredMaxHeight}px`,
})

let lastFocusedElement: HTMLElement | null = null

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(): HTMLElement[] {
  if (!panelRef.value) return []
  return Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

function focusFirstElement() {
  const [first] = getFocusableElements()
  if (first) {
    first.focus()
  } else {
    panelRef.value?.focus()
  }
}

function updatePanelLayout() {
  if (!props.open || !panelRef.value) {
    return
  }

  const bounds = resolvePopoverBounds(props.containerBounds, window.innerWidth, window.innerHeight)
  const size = computePopoverMaxSize(bounds, props.anchorTop, {
    preferredWidth: props.preferredWidth,
    preferredMaxHeight: props.preferredMaxHeight,
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    containerHeightRatio: props.containerBounds
      ? (props.containerHeightRatio ?? POPOVER_LAYOUT_DEFAULTS.containerHeightRatio)
      : undefined,
  })
  const panelRect = panelRef.value.getBoundingClientRect()
  const panelWidth = panelRect.width > 0 ? panelRect.width : size.maxWidth
  const panelHeight = panelRect.height > 0 ? panelRect.height : Math.min(size.maxHeight, 160)

  const layout = computePopoverLayout({
    anchorTop: props.anchorTop,
    anchorLeft: props.anchorLeft,
    anchorBottom: props.anchorBottom,
    panelWidth,
    panelHeight,
    container: props.containerBounds,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    preferredWidth: props.preferredWidth,
    preferredMaxHeight: props.preferredMaxHeight,
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    containerHeightRatio: props.containerHeightRatio,
  })

  panelStyle.value = {
    top: `${layout.top}px`,
    left: `${layout.left}px`,
    maxWidth: `${layout.maxWidth}px`,
    maxHeight: `${layout.maxHeight}px`,
  }
}

function onBackdropClick() {
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const focusable = getFocusableElements()
  if (focusable.length === 0) {
    event.preventDefault()
    return
  }

  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  const active = document.activeElement

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

function attachWindowListeners() {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', updatePanelLayout)
}

function detachWindowListeners() {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updatePanelLayout)
}

watch(
  () =>
    [
      props.open,
      props.anchorTop,
      props.anchorLeft,
      props.anchorBottom,
      props.containerBounds,
    ] as const,
  async () => {
    if (!props.open) {
      return
    }

    await nextTick()
    updatePanelLayout()
    await nextTick()
    updatePanelLayout()
  },
  { immediate: true },
)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      lastFocusedElement = document.activeElement as HTMLElement | null
      attachWindowListeners()
      await nextTick()
      await nextTick()
      focusFirstElement()
    } else {
      detachWindowListeners()
      lastFocusedElement?.focus()
      lastFocusedElement = null
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  detachWindowListeners()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="vp-popover-root">
      <button
        type="button"
        class="vp-popover-backdrop"
        tabindex="-1"
        aria-hidden="true"
        @click="onBackdropClick"
      />

      <section
        ref="panelRef"
        class="vp-popover"
        :class="panelClass"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        :style="panelStyle"
        tabindex="-1"
        @click.stop
      >
        <slot />
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.vp-popover-root {
  position: fixed;
  inset: 0;
  z-index: var(--vp-popover-z-index);
  pointer-events: none;
}

.vp-popover-backdrop {
  position: absolute;
  inset: 0;
  border: none;
  background: transparent;
  pointer-events: auto;
  cursor: default;
}

.vp-popover {
  position: fixed;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-popover-border);
  border-radius: var(--vp-popover-radius);
  background: var(--vp-popover-bg);
  box-shadow: var(--vp-popover-shadow);
  pointer-events: auto;
  overflow: hidden;
  box-sizing: border-box;
}

.vp-popover:focus-visible {
  outline: none;
}
</style>
