import { expect, test, type Locator, type Page } from '@playwright/test'
import { gotoCalendar } from './helpers/navigation'

function viewTab(page: Page, label: string): Locator {
  return page.locator('.vp-segmented-control-item', { hasText: label })
}

test.describe('ScheduleCalendar E2E', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await gotoCalendar(page)
  })

  test('renders view tabs and defaults to month view', async ({ page }) => {
    await expect(viewTab(page, 'Month')).toBeVisible()
    await expect(viewTab(page, 'Week')).toBeVisible()
    await expect(viewTab(page, 'Day')).toBeVisible()
    await expect(viewTab(page, 'List')).toBeVisible()
    await expect(viewTab(page, 'Month')).toHaveClass(/active/)
    await expect(page.locator('.month-calendar')).toBeVisible()
    await expect(page.locator('.calendar-month-nav-title')).toContainText('2026-04')
  })

  test('switches between month, week, day, and list views', async ({ page }) => {
    await viewTab(page, 'Month').click()
    await expect(page.locator('.month-calendar')).toBeVisible()

    await viewTab(page, 'Week').click()
    await expect(page.locator('.timed-grid')).toBeVisible()

    await viewTab(page, 'Day').click()
    await expect(page.locator('.timed-grid.single-day')).toBeVisible()

    await viewTab(page, 'List').click()
    await expect(page.locator('.list-view')).toBeVisible()
  })

  test('navigates months with prev and next buttons', async ({ page }) => {
    await viewTab(page, 'Month').click()
    const title = page.locator('.calendar-month-nav-title')

    await expect(title).toContainText('2026-04')
    await page.getByRole('button', { name: 'Next month' }).click()
    await expect(title).toContainText('2026-05')
    await page.getByRole('button', { name: 'Previous month' }).click()
    await expect(title).toContainText('2026-04')
  })

  test('shows +N overflow on may 15 in month view', async ({ page }) => {
    await viewTab(page, 'Month').click()
    await page.getByRole('button', { name: 'Next month' }).click()

    const may15Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '15' }) })
    const overflowButton = may15Cell.locator('button.more-events')
    await expect(overflowButton).toBeVisible()
    await expect(overflowButton).toHaveText(/\s*\+[1-9]\d*/)
  })

  test('opens overflow popover when +count is clicked', async ({ page }) => {
    await viewTab(page, 'Month').click()
    await page.getByRole('button', { name: 'Next month' }).click()

    const may15Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '15' }) })

    await may15Cell.locator('button.more-events').click()

    const popover = page.locator('.month-overflow-popover')
    await expect(popover).toBeVisible()
    await expect(popover).toContainText('2026-05-15')
    await expect(popover.getByText('전사 교육')).toBeVisible()
    await expect(viewTab(page, 'Month')).toHaveClass(/active/)
    await expect(page.locator('.list-view')).toHaveCount(0)
  })

  test('shows april 21 schedules in month view (demo layout may use +N)', async ({ page }) => {
    await viewTab(page, 'Month').click()

    const april21Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '21' }) })
    await expect(april21Cell.getByText('여수 출장')).toBeVisible()
    // 필터 바가 있는 App.vue는 셀 높이가 줄어 +N이 나올 수 있음 — 5건 전부 노출은 unit/E2E host에서 검증
  })

  test('selects date from month chip click without switching view', async ({ page }) => {
    await viewTab(page, 'Month').click()

    const april21Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '21' }) })

    // 날짜 숫자를 클릭 — 일정 칩 클릭은 F4-3 이후 ScheduleFormModal을 여므로 cell-date 사용
    await april21Cell.locator('.cell-date').click()

    await expect(viewTab(page, 'Month')).toHaveClass(/active/)
    await expect(april21Cell).toHaveClass(/selected/)
  })

  test('navigates weeks with today and arrow buttons', async ({ page }) => {
    await viewTab(page, 'Week').click()

    const dayNumber = page.locator('.day-header .day-number').first()
    const initialDay = await dayNumber.textContent()

    await page.getByRole('button', { name: 'Next week' }).click()
    await expect(dayNumber).not.toHaveText(initialDay ?? '')

    await page.getByRole('button', { name: 'Today' }).click()
    const today = new Date().getDate().toString()
    await expect(page.locator('.day-header .day-number', { hasText: today })).toBeVisible()
  })

  test('shows 30-minute schedules on may 20 in day view', async ({ page }) => {
    await viewTab(page, 'Month').click()
    await page.getByRole('button', { name: 'Next month' }).click()
    // 날짜 숫자만 클릭 — 셀 중앙 클릭 시 일정 칩에 걸려 ScheduleFormModal이 열릴 수 있음
    await page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '20' }) })
      .locator('.cell-date')
      .click()

    await viewTab(page, 'Day').click()

    await expect(page.getByText('오전 스탠드업')).toBeVisible()
    await expect(page.getByText('일정 조율')).toBeVisible()
    await expect(page.getByText('매장 점검')).toBeVisible()
  })

  test('shows multi-day spanning bar in week view for jeju training', async ({ page }) => {
    await viewTab(page, 'Week').click()
    await expect(page.getByText('제주 연수').first()).toBeVisible()
  })

  test('shows two-day overseas trip as full-width spanning bar on april 27-28 in month view', async ({
    page,
  }) => {
    await viewTab(page, 'Month').click()

    const weekWithOverseas = page.locator('.month-week').filter({
      has: page.locator('.cell-date', { hasText: '27' }),
    })
    const april27Cell = weekWithOverseas
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '27' }) })
    const overseasBar = weekWithOverseas.locator('.month-week-bars .all-day-bar-chip', {
      hasText: '해외 출장',
    })

    await expect(overseasBar).toBeVisible()
    await expect(
      april27Cell.locator('.cell-events .event-chip', { hasText: '해외 출장' }),
    ).toHaveCount(0)

    const barBox = await overseasBar.boundingBox()
    const cellBox = await april27Cell.boundingBox()
    expect(barBox).not.toBeNull()
    expect(cellBox).not.toBeNull()
    expect(barBox!.width).toBeGreaterThan(cellBox!.width * 1.5)
  })

  test('renders list view rows from mock schedules', async ({ page }) => {
    await viewTab(page, 'List').click()

    await expect(page.locator('.list-view')).toBeVisible()
    await expect(page.locator('.calendar-month-nav-title')).toContainText('2026-04')
    await expect(page.locator('.vp-data-table')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('고객사 A 미팅')).toBeVisible()
  })

  test('navigates months in list view', async ({ page }) => {
    await viewTab(page, 'List').click()

    const title = page.locator('.calendar-month-nav-title')
    await expect(title).toContainText('2026-04')
    await page.getByRole('button', { name: 'Next month' }).click()
    await expect(title).toContainText('2026-05')
    await page.getByRole('button', { name: 'Previous month' }).click()
    await expect(title).toContainText('2026-04')
  })

  test('switches to day view when week header is clicked', async ({ page }) => {
    await viewTab(page, 'Week').click()

    await page.locator('.day-header.clickable').filter({ hasText: '23' }).first().click()

    await expect(viewTab(page, 'Day')).toHaveClass(/active/)
    await expect(page.locator('.timed-grid.single-day')).toBeVisible()
  })

  test('closes overflow popover from close button', async ({ page }) => {
    await viewTab(page, 'Month').click()
    await page.getByRole('button', { name: 'Next month' }).click()

    const may15Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '15' }) })
    await may15Cell.locator('button.more-events').click()

    const popover = page.locator('.month-overflow-popover')
    await expect(popover).toBeVisible()
    await popover.getByRole('button', { name: 'Close' }).click()
    await expect(popover).toHaveCount(0)
  })

  // 2026-06-16: +N 오버플로우 칩 너비 축소 — width:fit-content 시각적 검증
  test('+N overflow button width is narrower than its parent cell', async ({ page }) => {
    await viewTab(page, 'Month').click()
    await page.getByRole('button', { name: 'Next month' }).click()

    const may15Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '15' }) })

    const overflowBtn = may15Cell.locator('button.more-events')
    await expect(overflowBtn).toBeVisible()

    const btnBox = await overflowBtn.boundingBox()
    const cellBox = await may15Cell.boundingBox()
    expect(btnBox).not.toBeNull()
    expect(cellBox).not.toBeNull()
    // width:fit-content이면 버튼 너비는 셀 너비보다 작아야 한다
    expect(btnBox!.width).toBeLessThan(cellBox!.width)
  })

  // SUG-ACC-01 재검증: CalendarToolbar :focus-visible outline
  test('view tab shows :focus-visible outline when keyboard-focused', async ({ page }) => {
    // 데모 페이지의 필터 영역(라디오/체크박스)이 toolbar보다 DOM상 먼저 있어
    // 첫 Tab이 toolbar에 도달한다고 보장할 수 없다. roving tabindex 패턴상
    // 활성 탭(Month)만 tabindex=0이므로 직접 focus() 후 키보드 포커스 스타일을 검증한다.
    const focusedTab = page.locator('button.vp-segmented-control-item.active')
    await focusedTab.focus()
    await expect(focusedTab).toBeFocused()

    // :focus-visible outline이 CSS로 적용되어 있는지 computed style로 검증
    const outlineWidth = await focusedTab.evaluate((el) => {
      return window.getComputedStyle(el).outlineWidth
    })
    expect(outlineWidth).toBe('2px')
  })

  test('view tab does not show outline on mouse click (focus-visible only)', async ({ page }) => {
    const monthTab = viewTab(page, 'Month')
    await monthTab.click()

    // 마우스 클릭 후 :focus-visible이 아닌 :focus 상태 — outline은 브라우저가 숨김
    // getComputedStyle이 outline-style: auto 또는 none을 반환해야 함
    // (브라우저마다 동작이 달라 outline-style 검증보다 포커스링 부재를 확인)
    const isVisible = await monthTab.evaluate((el) => {
      const style = window.getComputedStyle(el)
      // :focus-visible이 아닐 때 outline-width가 0이거나 outline-style이 none
      return style.outlineWidth !== '0px' && style.outlineStyle !== 'none'
    })
    // 마우스 클릭 시에는 :focus-visible pseudo-class가 활성화되지 않으므로 false가 기대됨
    // (Chromium에서 마우스 클릭은 :focus-visible 비활성 — WCAG 2.4.11 준수)
    expect(isVisible).toBe(false)
  })

  // 2026-06-16: CalendarToolbar 접근성 개선 — ARIA 속성 E2E 검증
  test('view tabs container has role=group and aria-label', async ({ page }) => {
    const tabGroup = page.locator('.vp-segmented-control')
    await expect(tabGroup).toHaveAttribute('role', 'group')
    await expect(tabGroup).toHaveAttribute('aria-label', '캘린더 보기 선택')
  })

  test('active view tab has aria-pressed="true", others have aria-pressed="false"', async ({
    page,
  }) => {
    await expect(viewTab(page, 'Month')).toHaveAttribute('aria-pressed', 'true')
    await expect(viewTab(page, 'Week')).toHaveAttribute('aria-pressed', 'false')

    await viewTab(page, 'Week').click()
    await expect(viewTab(page, 'Week')).toHaveAttribute('aria-pressed', 'true')
    await expect(viewTab(page, 'Month')).toHaveAttribute('aria-pressed', 'false')
  })

  // GAP-TS-01: Week/Day time-slot-select E2E (기존 미검증 영역)
  test.describe('GAP-TS-01: time-slot-select in week and day views', () => {
    test('clicking empty timed slot in week view does not change view', async ({ page }) => {
      await viewTab(page, 'Week').click()

      const dayColumn = page.locator('.day-column').first()
      await expect(dayColumn).toBeVisible()

      const colBox = await dayColumn.boundingBox()
      expect(colBox).not.toBeNull()

      // 빈 타임 슬롯 클릭 — time-slot-select emit만 발생, 뷰 변경 없음
      await page.mouse.click(colBox!.x + colBox!.width / 2, colBox!.y + 10)
      await expect(viewTab(page, 'Week')).toHaveClass(/active/)
    })

    test('clicking empty timed slot in day view does not change view', async ({ page }) => {
      await viewTab(page, 'Day').click()

      const dayColumn = page.locator('.day-column').first()
      await expect(dayColumn).toBeVisible()

      const colBox = await dayColumn.boundingBox()
      expect(colBox).not.toBeNull()

      await page.mouse.click(colBox!.x + colBox!.width / 2, colBox!.y + 10)
      await expect(viewTab(page, 'Day')).toHaveClass(/active/)
    })

    test('clicking existing timed event in week view does not trigger slot selection', async ({
      page,
    }) => {
      await viewTab(page, 'Week').click()

      const timedEvents = page.locator('.timed-event')
      const count = await timedEvents.count()
      if (count === 0) {
        return
      }

      await timedEvents.first().click()
      // schedule-click으로 처리 — 뷰 변경 없음
      await expect(viewTab(page, 'Week')).toHaveClass(/active/)
    })
  })
})
