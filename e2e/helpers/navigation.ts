import { expect, type Page } from '@playwright/test'

/** preview 서버 기동·Vue 마운트 대기 후 캘린더 루트가 보일 때까지 기다립니다. */
export async function gotoCalendar(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.schedule-calendar')).toBeVisible({ timeout: 15_000 })
}
