import { describe, expect, it } from 'vitest'
import { computePopoverLayout, computePopoverMaxSize, resolvePopoverBounds, toRectBounds } from './popover'

describe('popoverLayout', () => {
  const viewport = { width: 1280, height: 800 }

  it('caps popover size to a narrow calendar container', () => {
    const container = toRectBounds({
      top: 100,
      left: 200,
      right: 520,
      bottom: 700,
      width: 320,
      height: 600,
    })

    const size = computePopoverMaxSize(
      resolvePopoverBounds(container, viewport.width, viewport.height),
      420,
      { containerHeightRatio: 0.45 },
    )

    expect(size.maxWidth).toBe(304)
    expect(size.maxHeight).toBeLessThan(360)
    expect(size.maxHeight).toBe(262)
  })

  it('keeps popover default size on full viewport when container is absent', () => {
    const bounds = resolvePopoverBounds(null, viewport.width, viewport.height)
    const size = computePopoverMaxSize(bounds, 120)

    expect(size.maxWidth).toBe(320)
    expect(size.maxHeight).toBe(360)
  })

  it('clamps popover position inside container bounds', () => {
    const container = toRectBounds({
      top: 80,
      left: 120,
      right: 920,
      bottom: 680,
      width: 800,
      height: 600,
    })

    const layout = computePopoverLayout({
      anchorTop: 500,
      anchorLeft: 850,
      anchorBottom: 520,
      panelWidth: 280,
      panelHeight: 200,
      container,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
    })

    expect(layout.left + 280).toBeLessThanOrEqual(912)
    expect(layout.top).toBeGreaterThanOrEqual(88)
    expect(layout.top + Math.min(200, layout.maxHeight)).toBeLessThanOrEqual(672)
  })

  it('limits height for fixed-panel-like short containers', () => {
    const container = toRectBounds({
      top: 150,
      left: 32,
      right: 992,
      bottom: 750,
      width: 960,
      height: 600,
    })

    const size = computePopoverMaxSize(resolvePopoverBounds(container, 1024, 768), 420, {
      containerHeightRatio: 0.45,
    })

    expect(size.maxWidth).toBe(320)
    expect(size.maxHeight).toBe(262)
  })

  it('flips above the anchor when there is not enough space below', () => {
    const container = toRectBounds({
      top: 100,
      left: 100,
      right: 500,
      bottom: 500,
      width: 400,
      height: 400,
    })

    const layout = computePopoverLayout({
      anchorTop: 470,
      anchorLeft: 120,
      anchorBottom: 490,
      panelWidth: 240,
      panelHeight: 180,
      container,
      viewportWidth: 600,
      viewportHeight: 600,
    })

    expect(layout.top).toBeLessThan(470)
    expect(layout.top).toBeGreaterThanOrEqual(108)
  })
})
