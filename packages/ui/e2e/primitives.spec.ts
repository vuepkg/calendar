import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('button-default')).toBeVisible()
})

test.describe('Button', () => {
  test('emits a real click in the browser and updates app state', async ({ page }) => {
    await page.getByTestId('button-default').click()
    await expect(page.getByTestId('button-click-count')).toHaveText('1')
  })

  test('disabled button does not receive click', async ({ page }) => {
    const disabledButton = page.getByTestId('button-disabled')
    await expect(disabledButton).toBeDisabled()
  })

  test('shows a focus-visible outline when keyboard-focused', async ({ page }) => {
    const button = page.getByTestId('button-default')
    await button.focus()
    const outlineWidth = await button.evaluate((el) => window.getComputedStyle(el).outlineWidth)
    expect(outlineWidth).not.toBe('0px')
  })
})

test.describe('IconButton', () => {
  test('emits click and exposes its accessible name via aria-label', async ({ page }) => {
    const addButton = page.getByTestId('icon-button-md')
    await expect(addButton).toHaveAttribute('aria-label', 'Add')
    await addButton.click()
    await expect(page.getByTestId('icon-button-click-count')).toHaveText('1')
  })

  test('sm size renders a visibly smaller square than md', async ({ page }) => {
    const md = await page.getByTestId('icon-button-md').boundingBox()
    const sm = await page.getByTestId('icon-button-sm').boundingBox()
    expect(sm!.width).toBeLessThan(md!.width)
  })

  test('disabled icon button cannot be clicked', async ({ page }) => {
    await expect(page.getByTestId('icon-button-disabled')).toBeDisabled()
  })
})

test.describe('Chip', () => {
  test('non-clickable chip has no button role and ignores clicks', async ({ page }) => {
    const chip = page.getByTestId('chip-static')
    await expect(chip).not.toHaveAttribute('role', 'button')
    await chip.click()
    await expect(page.getByTestId('chip-click-count')).toHaveText('0')
  })

  test('clickable chip responds to mouse click and Enter key', async ({ page }) => {
    const chip = page.getByTestId('chip-clickable')
    await expect(chip).toHaveAttribute('role', 'button')
    await chip.click()
    await expect(page.getByTestId('chip-click-count')).toHaveText('1')

    await chip.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('chip-click-count')).toHaveText('2')
  })

  test('colored chip renders the configured inline colors', async ({ page }) => {
    const chip = page.getByTestId('chip-colored')
    const color = await chip.evaluate((el) => window.getComputedStyle(el).color)
    expect(color).toBe('rgb(220, 38, 38)')
  })
})

test.describe('SegmentedControl', () => {
  test('clicking an option updates the bound v-model value', async ({ page }) => {
    await page.locator('.vp-segmented-control-item', { hasText: 'Week' }).click()
    await expect(page.getByTestId('segmented-control-value')).toHaveText('week')
  })

  test('ArrowRight moves selection and focus to the next option', async ({ page }) => {
    const monthItem = page.locator('.vp-segmented-control-item', { hasText: 'Month' })
    await monthItem.focus()
    await page.keyboard.press('ArrowRight')

    await expect(page.getByTestId('segmented-control-value')).toHaveText('week')
    const weekItem = page.locator('.vp-segmented-control-item', { hasText: 'Week' })
    await expect(weekItem).toBeFocused()
  })

  test('only the active option is reachable via Tab (roving tabindex)', async ({ page }) => {
    const monthItem = page.locator('.vp-segmented-control-item', { hasText: 'Month' })
    const weekItem = page.locator('.vp-segmented-control-item', { hasText: 'Week' })
    await expect(monthItem).toHaveAttribute('tabindex', '0')
    await expect(weekItem).toHaveAttribute('tabindex', '-1')
  })

  test('group has role=group and the configured aria-label', async ({ page }) => {
    const group = page.locator('.vp-segmented-control')
    await expect(group).toHaveAttribute('role', 'group')
    await expect(group).toHaveAttribute('aria-label', 'Demo view selection')
  })
})
