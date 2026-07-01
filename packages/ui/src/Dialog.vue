<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  ariaLabel: string
  panelClass?: string | string[] | Record<string, boolean>
}>()

const emit = defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
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
}

function detachWindowListeners() {
  window.removeEventListener('keydown', onKeydown)
}

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
    <div v-if="open" class="vp-dialog-root">
      <button
        type="button"
        class="vp-dialog-backdrop"
        tabindex="-1"
        aria-hidden="true"
        @click="onBackdropClick"
      />

      <section
        ref="panelRef"
        class="vp-dialog"
        :class="panelClass"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        tabindex="-1"
        @click.stop
      >
        <slot />
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.vp-dialog-root {
  position: fixed;
  inset: 0;
  z-index: var(--vp-dialog-z-index);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.vp-dialog-backdrop {
  position: absolute;
  inset: 0;
  border: none;
  background: var(--vp-dialog-backdrop-bg);
  cursor: default;
}

.vp-dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--vp-dialog-max-width);
  max-height: calc(100vh - 32px);
  border: 1px solid var(--vp-dialog-border);
  border-radius: var(--vp-dialog-radius);
  background: var(--vp-dialog-bg);
  box-shadow: var(--vp-dialog-shadow);
  overflow: hidden;
  box-sizing: border-box;
}

.vp-dialog:focus-visible {
  outline: none;
}
</style>
