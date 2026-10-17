import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = [
  ['home', '/'],
  ['cars', '/cars'],
  ['car detail', '/cars/mercedes-gls'],
  ['bookings', '/bookings'],
  ['blog', '/blog'],
  ['blog post', '/blog/choose-the-right-car'],
  ['about', '/about'],
  ['contact', '/contact'],
  ['not found', '/missing'],
]

async function scan(page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(350)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  return results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s), e.g. ${v.nodes[0].html.slice(0, 110)} ${JSON.stringify(v.nodes[0].any[0]?.data ?? {}).slice(0, 160)}`)
}

const SEED = [{
  ref: 'MSR-SEED01', carId: 'toyota-camry', carName: 'Toyota Camry', colorId: 'red',
  pickup: new Date(2031, 2, 10, 10), dropoff: new Date(2031, 2, 13, 10), pickupLocation: 'cai', dropoffLocation: 'nasr', extras: ['insurance'],
  status: 'confirmed', createdAt: new Date().toISOString(), payment: 'cash',
  quote: { days: 3, base: 2700, extrasTotal: 600, subtotal: 3300, vat: 462, total: 3762 }, customer: { name: 'A', email: 'a@b.co', phone: '01012345678' },
}]

for (const [lang, theme] of [['en', 'light'], ['en', 'dark'], ['ar', 'light'], ['ar', 'dark']]) {
  for (const [name, path] of PAGES) {
    test(`${name} has no accessibility violations (${lang}, ${theme})`, async ({ page }) => {
      await page.addInitScript(([l, t, seed]) => {
        localStorage.setItem('masar.lang', JSON.stringify(l))
        localStorage.setItem('masar.theme', JSON.stringify(t))
        localStorage.setItem('masar.bookings', JSON.stringify(seed))
      }, [lang, theme, SEED])
      await page.goto(path)
      expect(await scan(page)).toEqual([])
    })
  }
}

test('the booking form with errors has no accessibility violations', async ({ page }) => {
  await page.goto('/cars/toyota-camry')
  await page.getByRole('button', { name: 'Reserve now' }).click()
  expect(await scan(page)).toEqual([])
})

test('the home search with errors has no accessibility violations', async ({ page }) => {
  await page.goto('/')
  const form = page.getByRole('form', { name: 'Find a car' })
  await form.getByLabel('From').fill('2020-01-01')
  await form.getByRole('button', { name: 'Search cars' }).click()
  expect(await scan(page)).toEqual([])
})

test('the cancel dialog has no accessibility violations', async ({ page }) => {
  await page.addInitScript((seed) => localStorage.setItem('masar.bookings', JSON.stringify(seed)), SEED)
  await page.goto('/bookings')
  await page.getByRole('button', { name: /Cancel booking/ }).click()
  expect(await scan(page)).toEqual([])
})

test('an open FAQ and the filtered catalog have no accessibility violations', async ({ page }) => {
  await page.goto('/about')
  await page.getByRole('button', { name: 'Can I cancel?' }).click()
  expect(await scan(page)).toEqual([])
  await page.goto('/cars?type=suv&max=4000')
  expect(await scan(page)).toEqual([])
})

test('the whole booking journey is possible with the keyboard alone', async ({ page, isMobile, browserName }) => {
  test.skip(isMobile, 'keyboard navigation is a desktop concern')
  test.skip(browserName === 'webkit', 'Safari does not Tab to links by default (Option+Tab)')
  await page.goto('/cars')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  const book = page.getByRole('link', { name: /Book Volkswagen Polo/ })
  await book.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/cars\/vw-polo/)
  await page.getByLabel('Pick-up date').focus()
  await page.keyboard.type('03102031')
  await page.getByLabel('Return date').focus()
  await page.keyboard.type('03122031')
  await page.getByLabel('Pick-up location').selectOption('cai')
  await page.getByLabel('Return location').selectOption('cai')
  await page.getByLabel('Full name').fill('Mona Ali')
  await page.getByLabel('Mobile number').fill('01012345678')
  await page.getByLabel('Email', { exact: true }).fill('mona@example.com')
  await page.getByLabel('Cash at pick-up').focus()
  await page.keyboard.press('Space')
  await page.getByLabel(/I have read the rental terms/).focus()
  await page.keyboard.press('Space')
  await page.getByRole('button', { name: 'Reserve now' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Booking confirmed')).toBeVisible()
})

test('focus is visible on interactive elements', async ({ page, isMobile, browserName }) => {
  test.skip(isMobile || browserName === 'webkit', 'keyboard focus ring check is for desktop Chromium and Firefox')
  await page.goto('/cars')
  await page.getByLabel('Search').focus()
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).boxShadow)
  expect(outline).not.toBe('none')
})
