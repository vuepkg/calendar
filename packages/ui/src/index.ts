export { default as Button } from './Button.vue'
export { default as Chip } from './Chip.vue'
export { default as Dialog } from './Dialog.vue'
export { default as IconButton } from './IconButton.vue'
export { default as Popover } from './Popover.vue'
export { default as SegmentedControl } from './SegmentedControl.vue'

// DataTable is intentionally NOT re-exported from the barrel — it's only used by calendar's
// (lazy-loaded) List view, so keeping it out of index.ts lets bundlers exclude it from the
// eager chunk shared with Button/IconButton/etc. Import it from '@vuepkg/ui/DataTable' instead.
