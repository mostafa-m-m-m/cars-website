import { expect, test } from '@playwright/test'

// Fixed far-future dates so the tests do not depend on today's date.
const FROM = '2031-03-10'
const TO = '2031-03-13' // 3 days
const PAGES = [
  ['/', 'Rent the right car. Pay the price you see.'],
  ['/cars', 'Cars'],
  ['/cars/toyota-camry', 'Toyota Camry'],
  ['/bookings', 'My bookings'],
  ['/blog', 'Blog'],
  ['/blog/driving-in-cairo', 'Driving in Cairo: four tips for visitors'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
]

async function fillBooking(page, { from = FROM, to = TO, extra = true } = {}) {
  await page.getByLabel('Pick-up date').fill(from)
  await page.getByLabel('Return date').fill(to)
  await page.getByLabel('Pick-up location').selectOption('cai')
  await page.getByLabel('Return location').selectOption('nasr')
  if (extra) await page.getByLabel('Full insurance cover').check()
  await page.getByLabel('Full name').fill('Mona Ali')
  await page.getByLabel('Mobile number').fill('010 1234 5678')
  await page.getByLabel('Email', { exact: true }).fill('mona@example.com')
  await page.getByLabel('Cash at pick-up').check()
  await page.getByLabel(/I have read the rental terms/).check()
}

test.describe('navigation', () => {
  for (const [path, heading] of PAGES) {
    test(`${path} renders its heading and title`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
      await expect(page).toHaveTitle(/Masar/)
    })
  }

  test('every header and footer link leads to a real page', async ({ page }) => {
    await page.goto('/')
    const hrefs = await page.locator('header.nav a[href^="/"], footer a[href^="/"]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('href')))])
    expect(hrefs.length).toBeGreaterThan(5)
    for (const href of hrefs) {
      await page.goto(href)
      await expect(page.getByText('Page not found'), href).toHaveCount(0)
    }
  })

  test('unknown routes, cars and posts show a 404 instead of crashing', async ({ page }) => {
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    for (const path of ['/nope/nothing', '/cars/does-not-exist', '/blog/does-not-exist']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: 'Page not found' }), path).toBeVisible()
    }
    expect(errors).toEqual([])
  })

  test('old URLs from the first version still work', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/\/$/)
    await page.goto('/blogs')
    await expect(page).toHaveURL(/\/blog$/)
    await page.goto('/blogs/driving-in-cairo')
    await expect(page).toHaveURL(/\/blog\/driving-in-cairo$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Driving in Cairo')
  })

  test('mobile menu opens, navigates and closes with Escape', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'only the phone layout has a menu button')
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('link', { name: 'Cars' }).first().click()
    await expect(page).toHaveURL(/\/cars/)
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('home search', () => {
  test('validates the dates, then opens the catalog with prices for the whole stay', async ({ page }) => {
    await page.goto('/')
    const form = page.getByRole('form', { name: 'Find a car' })
    await form.getByLabel('From').fill('2020-01-01')
    await form.getByRole('button', { name: 'Search cars' }).click()
    await expect(form.getByText('Pick-up cannot be in the past.')).toBeVisible()

    await form.getByLabel('From').fill(FROM)
    await form.getByLabel('To').fill('2031-03-09')
    await form.getByRole('button', { name: 'Search cars' }).click()
    await expect(form.getByText('The return must be after the pick-up.')).toBeVisible()

    await form.getByLabel('To').fill(TO)
    await form.getByLabel('Car type').selectOption('suv')
    await form.getByRole('button', { name: 'Search cars' }).click()
    await expect(page).toHaveURL(/\/cars\?.*from=2031-03-10.*to=2031-03-13/)
    await expect(page.getByText('Showing the total price for a rental of 3 day(s).')).toBeVisible()
    await expect(page.getByText('Cars found: 1')).toBeVisible()
    // GLS: 3800 x 3 = 11,400 + 14% VAT = 12,996
    await expect(page.getByText('12,996 EGP for 3 day(s)')).toBeVisible()
  })
})

test.describe('catalog', () => {
  test('lists the whole fleet with real names, prices and ratings', async ({ page }) => {
    await page.goto('/cars')
    await expect(page.getByText('Cars found: 9')).toBeVisible()
    await expect(page.locator('.car-card__title')).toHaveCount(9)
    await expect(page.getByRole('img', { name: /Rated 4.6 out of 5 from 128 reviews/ })).toBeVisible()
  })

  test('search, type, seats and fuel filters combine and live in the URL', async ({ page }) => {
    await page.goto('/cars')
    await page.getByLabel('Search').fill('bmw')
    await expect(page).toHaveURL(/q=bmw/)
    await expect(page.getByText('Cars found: 2')).toBeVisible()
    await page.getByLabel('Type').selectOption('suv')
    await expect(page.getByText('Cars found: 0')).toBeVisible()
    await expect(page.getByText('No cars match these filters')).toBeVisible()
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page.getByText('Cars found: 9')).toBeVisible()
    await page.getByLabel('Seats').selectOption('7')
    await expect(page.getByText('Cars found: 1')).toBeVisible()
    await page.getByLabel('Seats').selectOption('0')
    await expect(page.getByText('Cars found: 9')).toBeVisible()
    await page.getByLabel('Fuel').selectOption('electric')
    await expect(page.getByText('Cars found: 1')).toBeVisible()
    await expect(page.locator('.car-card__title')).toHaveText('Tesla Electric SUV')
  })

  test('sorts by price in both directions', async ({ page }) => {
    await page.goto('/cars')
    const prices = async () => (await page.locator('.car-card .price strong').allTextContents()).map((s) => Number(s.replace(/[^\d]/g, '')))
    const isSorted = (list, dir) => list.every((v, i) => i === 0 || (dir === 'asc' ? list[i - 1] <= v : list[i - 1] >= v))
    await page.getByLabel('Sort by').selectOption('priceAsc')
    await expect.poll(async () => { const p = await prices(); return p.length === 9 && isSorted(p, 'asc') && p[0] === 700 }).toBe(true)
    await page.getByLabel('Sort by').selectOption('priceDesc')
    await expect.poll(async () => { const p = await prices(); return p.length === 9 && isSorted(p, 'desc') && p[0] === 4500 }).toBe(true)
  })

  test('the price slider limits results', async ({ page }) => {
    await page.goto('/cars?max=1000')
    await expect(page.locator('.car-card').first()).toBeVisible()
    const prices = (await page.locator('.car-card .price strong').allTextContents()).map((s) => Number(s.replace(/[^\d]/g, '')))
    expect(prices.length).toBeGreaterThan(0)
    expect(Math.max(...prices)).toBeLessThanOrEqual(1000)
  })

  test('filters from the URL are applied on load and survive a reload', async ({ page }) => {
    await page.goto('/cars?type=coupe&sort=priceAsc')
    await expect(page.getByLabel('Type')).toHaveValue('coupe')
    await page.reload()
    await expect(page.getByLabel('Type')).toHaveValue('coupe')
    await expect(page.getByText('Cars found: 3')).toBeVisible()
  })

  test('garbage in the URL does not break the page', async ({ page }) => {
    await page.goto('/cars?seats=abc&max=-5&sort=hack&type=%3Cscript%3E')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cars')
  })
})

test.describe('booking', () => {
  test('colour swatches change the car image', async ({ page }) => {
    await page.goto('/cars/toyota-camry')
    await expect(page.getByRole('img', { name: 'Toyota Camry, Burgundy' })).toBeVisible()
    await page.getByText('White', { exact: true }).click()
    await expect(page.getByRole('img', { name: 'Toyota Camry, White' })).toBeVisible()
  })

  test('shows a live price breakdown: days, extras, VAT and total', async ({ page }) => {
    await page.goto('/cars/toyota-camry')
    const summary = page.getByLabel('Price summary')
    await expect(summary.getByText('Choose your dates to see the price.')).toBeVisible()
    await page.getByLabel('Pick-up date').fill(FROM)
    await page.getByLabel('Return date').fill(TO)
    await expect(summary.getByText('2,700 EGP')).toBeVisible()
    await expect(summary.getByText('378 EGP')).toBeVisible() // 14% VAT
    await expect(summary.getByText('3,078 EGP')).toBeVisible()
    await page.getByLabel('Full insurance cover').check()
    await expect(summary.getByText('600 EGP')).toBeVisible() // 200 x 3
    await expect(summary.getByText('3,762 EGP')).toBeVisible()
    await page.getByLabel('Full insurance cover').uncheck()
    await expect(summary.getByText('3,078 EGP')).toBeVisible()
  })

  test('a short rental that crosses 24 hours counts the extra day', async ({ page }) => {
    await page.goto('/cars/vw-polo')
    await page.getByLabel('Pick-up date').fill(FROM)
    await page.getByLabel('Return date').fill(TO)
    await page.getByLabel('Return time').fill('11:00')
    // 3 days and 1 hour -> 4 days x 700 = 2,800 + 392 VAT
    await expect(page.getByLabel('Price summary').getByText('3,192 EGP')).toBeVisible()
  })

  test('validates every field and moves focus to the first problem', async ({ page }) => {
    await page.goto('/cars/toyota-camry')
    await page.getByRole('button', { name: 'Reserve now' }).click()
    await expect(page.getByLabel('Pick-up date')).toBeFocused()
    await expect(page.getByText('Please choose a pick-up date.')).toBeVisible()
    await expect(page.getByText('Please choose a payment method.')).toBeVisible()
    await expect(page.getByText('Please accept the rental terms to continue.')).toBeVisible()
    await expect(page.getByText('Please enter a valid Egyptian mobile number.')).toBeVisible()
    await expect(page.getByLabel('Pick-up date')).toHaveAttribute('aria-invalid', 'true')
  })

  test('rejects a past pick-up, a return before pick-up and a rental over 30 days', async ({ page }) => {
    await page.goto('/cars/toyota-camry')
    const reserve = page.getByRole('button', { name: 'Reserve now' })
    await page.getByLabel('Pick-up date').fill('2020-01-01')
    await page.getByLabel('Return date').fill('2020-01-03')
    await reserve.click()
    await expect(page.getByText('Pick-up cannot be in the past.')).toBeVisible()
    await page.getByLabel('Pick-up date').fill(FROM)
    await page.getByLabel('Return date').fill('2031-03-09')
    await expect(page.getByText('The return must be after the pick-up.')).toBeVisible()
    await page.getByLabel('Return date').fill('2031-05-01')
    await expect(page.getByText('Rentals are limited to 30 days.')).toBeVisible()
  })

  test('payment methods are a single choice', async ({ page }) => {
    await page.goto('/cars/toyota-camry')
    await page.getByLabel('Cash at pick-up').check()
    await page.getByLabel('Card at pick-up').check()
    await expect(page.getByLabel('Cash at pick-up')).not.toBeChecked()
    await expect(page.getByLabel('Card at pick-up')).toBeChecked()
    await expect(page.getByText('We never ask for card details on this site.')).toBeVisible()
  })

  test('a complete booking is confirmed, listed, and survives a reload', async ({ page }) => {
    await page.goto(`/cars/toyota-camry?from=${FROM}&to=${TO}&pl=cai`)
    await expect(page.getByLabel('Pick-up date')).toHaveValue(FROM)
    await expect(page.getByLabel('Pick-up location')).toHaveValue('cai')
    await fillBooking(page)
    await page.getByRole('button', { name: 'Reserve now' }).click()

    await expect(page).toHaveURL(/\/bookings\?ref=MSR-/)
    await expect(page.getByText('Booking confirmed')).toBeVisible()
    const card = page.locator('.booking-card').first()
    await expect(card.getByRole('heading', { name: 'Toyota Camry' })).toBeVisible()
    await expect(card.getByText('3,762 EGP')).toBeVisible()
    await expect(card.getByText('Cairo International Airport')).toBeVisible()
    await expect(card.getByText('Full insurance cover')).toBeVisible()
    await expect(page.locator('.nav .badge')).toHaveText('1')

    await page.reload()
    await expect(page.locator('.booking-card')).toHaveCount(1)
  })

  test('the same car cannot be booked twice for overlapping dates', async ({ page }) => {
    await page.goto('/cars/toyota-camry')
    await fillBooking(page)
    await page.getByRole('button', { name: 'Reserve now' }).click()
    await expect(page).toHaveURL(/\/bookings/)

    await page.goto('/cars/toyota-camry')
    await fillBooking(page, { from: '2031-03-12', to: '2031-03-15', extra: false })
    await page.getByRole('button', { name: 'Reserve now' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'You already have a booking for this car' })).toBeVisible()
    await expect(page).toHaveURL(/\/cars\/toyota-camry/)

    // back to back is fine
    await fillBooking(page, { from: TO, to: '2031-03-16', extra: false })
    await page.getByRole('button', { name: 'Reserve now' }).click()
    await expect(page).toHaveURL(/\/bookings/)
    await expect(page.locator('.booking-card')).toHaveCount(2)
  })

  test('a different car can be booked for the same dates', async ({ page }) => {
    await page.goto('/cars/toyota-camry')
    await fillBooking(page)
    await page.getByRole('button', { name: 'Reserve now' }).click()
    await page.goto('/cars/nissan-maxima')
    await fillBooking(page)
    await page.getByRole('button', { name: 'Reserve now' }).click()
    await expect(page.locator('.booking-card')).toHaveCount(2)
  })
})

test.describe('my bookings', () => {
  test('shows an empty state with a way to start', async ({ page }) => {
    await page.goto('/bookings')
    await expect(page.getByText('You have no bookings yet.')).toBeVisible()
    await page.getByRole('link', { name: 'Browse cars' }).click()
    await expect(page).toHaveURL(/\/cars/)
  })

  test('cancelling asks first, can be abandoned, and marks the booking cancelled', async ({ page }) => {
    await page.goto('/cars/vw-polo')
    await fillBooking(page, { extra: false })
    await page.getByRole('button', { name: 'Reserve now' }).click()

    await page.getByRole('button', { name: /Cancel booking/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Cancel this booking?' })
    await expect(dialog.getByText('Free cancellation: pick-up is more than 24 hours away.')).toBeVisible()
    await dialog.getByRole('button', { name: 'Keep booking' }).click()
    await expect(page.getByText('Confirmed', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: /Cancel booking/ }).click()
    await page.getByRole('button', { name: 'Yes, cancel it' }).click()
    await expect(page.getByText('Cancelled', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Cancel booking/ })).toHaveCount(0)
    await expect(page.locator('.nav .badge')).toHaveCount(0)
  })

  test('a cancelled booking frees the car for those dates again', async ({ page }) => {
    await page.goto('/cars/vw-polo')
    await fillBooking(page, { extra: false })
    await page.getByRole('button', { name: 'Reserve now' }).click()
    await page.getByRole('button', { name: /Cancel booking/ }).click()
    await page.getByRole('button', { name: 'Yes, cancel it' }).click()
    await page.goto('/cars/vw-polo')
    await fillBooking(page, { extra: false })
    await page.getByRole('button', { name: 'Reserve now' }).click()
    await expect(page.getByText('Booking confirmed')).toBeVisible()
  })

  test('warns about a late cancellation when pick-up is within 24 hours', async ({ page }) => {
    // Seed a booking that starts in two hours, directly in storage.
    await page.addInitScript(() => {
      if (localStorage.getItem('masar.bookings')) return
      const start = new Date(Date.now() + 2 * 3600 * 1000)
      const end = new Date(Date.now() + 26 * 3600 * 1000)
      localStorage.setItem('masar.bookings', JSON.stringify([{
        ref: 'MSR-LATE01', carId: 'vw-polo', carName: 'Volkswagen Polo', colorId: 'blue', pickup: start, dropoff: end,
        pickupLocation: 'cai', dropoffLocation: 'cai', extras: [], status: 'confirmed', createdAt: new Date().toISOString(),
        quote: { days: 1, base: 700, extrasTotal: 0, subtotal: 700, vat: 98, total: 798 }, payment: 'cash', customer: { name: 'A', email: 'a@b.co', phone: '01012345678' },
      }]))
    })
    await page.goto('/bookings')
    await page.getByRole('button', { name: /Cancel booking/ }).click()
    await expect(page.getByText('a late cancellation fee may apply')).toBeVisible()
  })

  test('survives corrupted storage without crashing', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('masar.bookings', '{not json'))
    await page.goto('/bookings')
    await expect(page.getByText('You have no bookings yet.')).toBeVisible()
  })
})

test.describe('content widgets', () => {
  test('FAQ opens and closes with the mouse and keyboard', async ({ page }) => {
    await page.goto('/about')
    const q = page.getByRole('button', { name: 'Can I cancel?' })
    await expect(q).toHaveAttribute('aria-expanded', 'false')
    await q.click()
    await expect(q).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('Cancellation is free up to 24 hours')).toBeVisible()
    await q.focus()
    await page.keyboard.press('Enter')
    await expect(q).toHaveAttribute('aria-expanded', 'false')
  })

  test('review carousel wraps in both directions', async ({ page }) => {
    await page.goto('/')
    const group = page.getByRole('group', { name: 'What customers say' })
    await expect(group.getByText('1 of 4')).toBeVisible()
    await group.getByRole('button', { name: 'Previous' }).click()
    await expect(group.getByText('4 of 4')).toBeVisible()
    await group.getByRole('button', { name: 'Next' }).click()
    await expect(group.getByText('1 of 4')).toBeVisible()
  })

  test('contact form validates and confirms', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByLabel('Full name')).toBeFocused()
    await expect(page.getByText('Please write a message of at least ten characters.')).toBeVisible()
    await page.getByLabel('Full name').fill('Karim Adel')
    await page.getByLabel('Email', { exact: true }).fill('karim@example.com')
    await page.getByLabel('Message').fill('Do you have an automatic car for Friday?')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByRole('heading', { name: 'Message received' })).toBeVisible()
    await page.getByRole('button', { name: 'Send another message' }).click()
    await expect(page.getByLabel('Full name')).toHaveValue('')
  })

  test('blog opens a post and links back', async ({ page }) => {
    await page.goto('/blog')
    await page.getByRole('link', { name: 'What to check before you drive away' }).first().click()
    await expect(page).toHaveURL(/\/blog\/before-you-drive-away/)
    await page.getByRole('link', { name: 'All articles' }).click()
    await expect(page).toHaveURL(/\/blog$/)
  })
})

test.describe('settings', () => {
  test('Arabic flips to RTL, translates content and formats numbers, and is remembered', async ({ page }) => {
    await page.goto('/cars')
    await page.getByRole('button', { name: /^Language/ }).click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('السيارات')
    await expect(page.getByText('٩٠٠ ج.م')).toBeVisible()
    await expect(page.getByText('عدد السيارات: ٩')).toBeVisible()
    await page.goto('/cars/toyota-camry')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Toyota Camry')
    await expect(page.getByText('سيارة سيدان واسعة وموثوقة')).toBeVisible()
    await expect(page).toHaveTitle(/مسار/)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('booking works in Arabic with Arabic digits in the phone field', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('masar.lang', JSON.stringify('ar')))
    await page.goto('/cars/vw-polo')
    await page.getByLabel('تاريخ الاستلام').fill(FROM)
    await page.getByLabel('تاريخ الإرجاع').fill(TO)
    await page.getByLabel('مكان الاستلام').selectOption('maadi')
    await page.getByLabel('مكان الإرجاع').selectOption('maadi')
    await page.getByLabel('الاسم بالكامل').fill('منى علي')
    await page.getByLabel('رقم الموبايل').fill('٠١٠١٢٣٤٥٦٧٨')
    await page.getByLabel('البريد الإلكتروني').fill('mona@example.com')
    await page.getByLabel('نقدًا عند الاستلام').check()
    await page.getByLabel(/قرأت شروط الإيجار/).check()
    await page.getByRole('button', { name: 'احجز الآن' }).click()
    await expect(page.getByText('تم تأكيد الحجز')).toBeVisible()
  })

  test('theme toggles and is remembered', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await page.getByRole('button', { name: /^Theme/ }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})

test.describe('layout', () => {
  test('no horizontal scroll on any page, in English and Arabic', async ({ page }) => {
    test.setTimeout(120_000)
    for (const lang of ['en', 'ar']) {
      await page.addInitScript((l) => localStorage.setItem('masar.lang', JSON.stringify(l)), lang)
      for (const [path] of PAGES) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `${lang} ${path}`).toBeLessThanOrEqual(1)
      }
    }
  })

  test('car images have dimensions, so layout does not jump', async ({ page }) => {
    await page.goto('/cars')
    const missing = await page.locator('main img').evaluateAll((imgs) => imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).length)
    expect(missing).toBe(0)
  })

  test('route changes scroll to the top', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, 1500))
    await page.getByRole('link', { name: 'See all cars' }).click()
    await expect(page).toHaveURL(/\/cars/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
  })
})
