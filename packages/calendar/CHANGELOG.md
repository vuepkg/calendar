# @vuepkg/calendar

## 0.1.3

### Patch Changes

- Add SegmentedControl and Chip primitives (F2-2, F2-3) to @vuepkg/ui. SegmentedControl includes roving-tabindex arrow key navigation. CalendarToolbar, HolidayChip, and ScheduleEventChip now consume these primitives instead of duplicating markup/CSS.
- Updated dependencies
  - @vuepkg/ui@0.2.0

## 0.1.2

### Patch Changes

- Extract Button/IconButton navigation controls into a new @vuepkg/ui package (F2-1). CalendarPeriodNav and CalendarMonthNav now consume @vuepkg/ui instead of duplicating button CSS. Adds --vp-button-* component tokens to @vuepkg/theme.

## 0.1.1

### Patch Changes

- Updated dependencies
  - @vuepkg/core@0.1.1

## 0.1.0

### Minor Changes

- Phase 1: CSS variable theme system and dark mode support

### Patch Changes

- Updated dependencies
  - @vuepkg/core@0.1.0
