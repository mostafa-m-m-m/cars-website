// Rental dates and price. Pure functions: no React, no clock (callers pass `now`).

export const VAT_RATE = 0.14
export const MAX_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

// Combine "2030-01-10" and "10:00" into a local Date. Returns null if either part is missing or invalid.
export function toDate(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '')) return null
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const result = new Date(y, m - 1, d, hh, mm)
  // reject overflow such as 2030-02-31
  return result.getFullYear() === y && result.getMonth() === m - 1 && result.getDate() === d && hh < 24 && mm < 60 ? result : null
}

// Rental is charged in 24 hour periods; any started period counts. Minimum one day.
export function rentalDays(pickup, dropoff) {
  if (!pickup || !dropoff || dropoff <= pickup) return 0
  return Math.max(1, Math.ceil((dropoff - pickup) / DAY_MS))
}

// Returns an error key (a translation key) or null when the range is valid.
export function validateRange(pickup, dropoff, now = new Date()) {
  if (!pickup) return 'error.pickup'
  if (!dropoff) return 'error.dropoff'
  if (pickup < now) return 'error.pastPickup'
  if (dropoff <= pickup) return 'error.order'
  if (rentalDays(pickup, dropoff) > MAX_DAYS) return 'error.tooLong'
  return null
}

export function quote({ pricePerDay, days, extras = [] }) {
  if (!days || days < 1) return { days: 0, base: 0, extrasTotal: 0, subtotal: 0, vat: 0, total: 0 }
  const base = pricePerDay * days
  const extrasTotal = extras.reduce((sum, e) => sum + e.priceEgp * days, 0)
  const subtotal = base + extrasTotal
  const vat = Math.round(subtotal * VAT_RATE)
  return { days, base, extrasTotal, subtotal, vat, total: subtotal + vat }
}

// Two bookings of the same car overlap when each starts before the other ends.
export function overlaps(a, b) {
  return a.pickup < b.dropoff && b.pickup < a.dropoff
}

// "MSR-" + 6 base36 characters derived from a number (time) and a random part. Injected for tests.
export function makeReference(time = Date.now(), random = Math.random) {
  const part = (time % 2176782336).toString(36).toUpperCase().padStart(6, '0')
  const salt = Math.floor(random() * 36).toString(36).toUpperCase()
  return `MSR-${part.slice(-5)}${salt}`
}

// Free cancellation up to 24 hours before pick-up.
export function canCancelFree(pickup, now = new Date()) {
  return pickup - now >= DAY_MS
}
