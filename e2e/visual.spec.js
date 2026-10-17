import { expect, test } from '@playwright/test'

// Visual regression (Chromium). Baselines are per platform, so CI skips these.
// Create or refresh with: npx playwright test visual --update-snapshots
test.describe('@visual', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'one engine is enough for pixel diffs')

  for (const [name, path] of [['home', '/'], ['cars', '/cars'], ['car', '/cars/toyota-camry'], ['blog', '/blog']]) {
    test(`${name} page`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('masar.lang', JSON.stringify('en')))
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      // lazy images below the fold must be loaded before a full-page capture
      await page.evaluate(async () => {
        const imgs = [...document.images]
        imgs.forEach((i) => { i.loading = 'eager' })
        await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r }))))
      })
      await expect(page).toHaveScreenshot(`${name}.png`, { animations: 'disabled', fullPage: true })
    })
  }
})
