/** DOM `getBoundingClientRect` 기반 경계 */
export interface RectBounds {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

/** 팝오버 위치·크기 계산 입력 */
export interface PopoverLayoutInput {
  anchorTop: number
  anchorLeft: number
  anchorBottom?: number
  panelWidth: number
  panelHeight: number
  container?: RectBounds | null
  viewportWidth?: number
  viewportHeight?: number
  margin?: number
  preferredWidth?: number
  preferredMaxHeight?: number
  minWidth?: number
  minHeight?: number
  containerHeightRatio?: number
}

/** 팝오버 위치·크기 계산 결과 */
export interface PopoverLayoutResult {
  top: number
  left: number
  maxWidth: number
  maxHeight: number
}
