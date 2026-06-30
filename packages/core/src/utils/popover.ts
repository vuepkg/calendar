import type { PopoverLayoutInput, PopoverLayoutResult, RectBounds } from '../types/popover'

export const POPOVER_LAYOUT_DEFAULTS = {
  preferredWidth: 320,
  preferredMaxHeight: 360,
  minWidth: 140,
  minHeight: 120,
  containerHeightRatio: 0.45,
  margin: 8,
} as const

export function toRectBounds(rect: {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}): RectBounds {
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

export function resolvePopoverBounds(
  container: RectBounds | null | undefined,
  viewportWidth: number,
  viewportHeight: number,
  margin: number = POPOVER_LAYOUT_DEFAULTS.margin,
): RectBounds {
  if (!container) {
    return {
      top: margin,
      left: margin,
      right: viewportWidth - margin,
      bottom: viewportHeight - margin,
      width: viewportWidth - margin * 2,
      height: viewportHeight - margin * 2,
    }
  }

  const top = Math.max(margin, container.top + margin)
  const left = Math.max(margin, container.left + margin)
  const right = Math.min(viewportWidth - margin, container.right - margin)
  const bottom = Math.min(viewportHeight - margin, container.bottom - margin)

  return {
    top,
    left,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

export function computePopoverMaxSize(
  bounds: RectBounds,
  anchorTop: number,
  options: {
    preferredWidth?: number
    preferredMaxHeight?: number
    minWidth?: number
    minHeight?: number
    containerHeightRatio?: number
    margin?: number
  } = {},
): Pick<PopoverLayoutResult, 'maxWidth' | 'maxHeight'> {
  const {
    preferredWidth = POPOVER_LAYOUT_DEFAULTS.preferredWidth,
    preferredMaxHeight = POPOVER_LAYOUT_DEFAULTS.preferredMaxHeight,
    minWidth = POPOVER_LAYOUT_DEFAULTS.minWidth,
    minHeight = POPOVER_LAYOUT_DEFAULTS.minHeight,
    containerHeightRatio,
    margin = POPOVER_LAYOUT_DEFAULTS.margin,
  } = options

  const maxWidth = Math.max(minWidth, Math.min(preferredWidth, bounds.width))
  const belowAnchor = Math.max(0, bounds.bottom - anchorTop - margin)
  const ratioCap =
    containerHeightRatio === undefined
      ? preferredMaxHeight
      : Math.max(0, Math.floor(bounds.height * containerHeightRatio))

  const maxHeight = Math.max(minHeight, Math.min(preferredMaxHeight, belowAnchor, ratioCap))

  return { maxWidth, maxHeight }
}

export function computePopoverLayout(input: PopoverLayoutInput): PopoverLayoutResult {
  const margin = input.margin ?? POPOVER_LAYOUT_DEFAULTS.margin
  const viewportWidth = input.viewportWidth ?? 0
  const viewportHeight = input.viewportHeight ?? 0
  const bounds = resolvePopoverBounds(
    input.container,
    viewportWidth || Number.MAX_SAFE_INTEGER,
    viewportHeight || Number.MAX_SAFE_INTEGER,
    margin,
  )

  const { maxWidth, maxHeight } = computePopoverMaxSize(bounds, input.anchorTop, {
    preferredWidth: input.preferredWidth,
    preferredMaxHeight: input.preferredMaxHeight,
    minWidth: input.minWidth,
    minHeight: input.minHeight,
    containerHeightRatio: input.container
      ? (input.containerHeightRatio ?? POPOVER_LAYOUT_DEFAULTS.containerHeightRatio)
      : undefined,
    margin,
  })

  const panelWidth = Math.min(input.panelWidth, maxWidth)
  const panelHeight = Math.min(input.panelHeight, maxHeight)

  let top = input.anchorTop
  let left = input.anchorLeft

  if (top + panelHeight > bounds.bottom) {
    const anchorBottom = input.anchorBottom ?? input.anchorTop
    const aboveAnchor = anchorBottom - panelHeight - margin
    if (aboveAnchor >= bounds.top) {
      top = aboveAnchor
    } else {
      top = Math.max(bounds.top, bounds.bottom - panelHeight)
    }
  }

  if (left + panelWidth > bounds.right) {
    left = Math.max(bounds.left, bounds.right - panelWidth)
  }

  top = Math.min(top, bounds.bottom - panelHeight)
  top = Math.max(top, bounds.top)
  left = Math.min(left, bounds.right - panelWidth)
  left = Math.max(left, bounds.left)

  return {
    top,
    left,
    maxWidth,
    maxHeight,
  }
}
