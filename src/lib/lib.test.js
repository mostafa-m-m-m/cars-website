import { describe, expect, it } from 'vitest'
import { canCancelFree, makeReference, MAX_DAYS, overlaps, quote, rentalDays, toDate, validateRange } from './pricing'
import { filterCars, readFilters, sortCars } from './filters'
import { isEgyptianMobile, normalizePhone, validateBooking, validateContact } from './validate'
import { cars, carById, PRICE_MAX } from '../data/cars'
import { extras } from '../data/content'

const NOW = new Date(2030, 0, 1, 9, 0)
const d = (date, time = '10:00') => toDate(date, time)

describe('toDate', () => {
  it('builds a local date from date and time strings', () => {
    const date = toDate('2030-03-05', '14:30')
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()]).toEqual([2030, 2, 5, 14, 30])
  })

  it('rejects missing, malformed and impossible values', () => {
    for (const [a, b] of [['', '10:00'], ['2030-01-01', ''], ['2030-1-1', '10:00'], ['2030-02-31', '10:00'], ['2030-01-01', '25:00'], ['2030-01-01', '10:75'], [undefined, undefined]]) {
      expect(toDate(a, b), `${a} ${b}`).toBeNull()
    }
  })
})

describe('rentalDays', () => {
  it('charges 24 hour periods and counts any started period', () => {
    expect(rentalDays(d('2030-01-10'), d('2030-01-11'))).toBe(1)
    expect(rentalDays(d('2030-01-10'), d('2030-01-11', '10:01'))).toBe(2)
    expect(rentalDays(d('2030-01-10'), d('2030-01-13'))).toBe(3)
  })

  it('charges at least one day for a short rental', () => {
    expect(rentalDays(d('2030-01-10', '10:00'), d('2030-01-10', '12:00'))).toBe(1)
  })

  it('is zero for missing or reversed ranges', () => {
    expect(rentalDays(null, d('2030-01-11'))).toBe(0)
    expect(rentalDays(d('2030-01-11'), d('2030-01-10'))).toBe(0)
    expect(rentalDays(d('2030-01-10'), d('2030-01-10'))).toBe(0)
  })
})

describe('validateRange', () => {
  it('accepts a normal future range', () => {
    expect(validateRange(d('2030-01-10'), d('2030-01-13'), NOW)).toBeNull()
  })

  it('reports the first problem as a translation key', () => {
    expect(validateRange(null, d('2030-01-13'), NOW)).toBe('error.pickup')
    expect(validateRange(d('2030-01-10'), null, NOW)).toBe('error.dropoff')
    expect(validateRange(d('2029-12-31'), d('2030-01-13'), NOW)).toBe('error.pastPickup')
    expect(validateRange(d('2030-01-10'), d('2030-01-09'), NOW)).toBe('error.order')
    expect(validateRange(d('2030-01-10'), d('2030-01-10'), NOW)).toBe('error.order')
  })

  it('limits the rental length', () => {
    expect(validateRange(d('2030-01-10'), d('2030-02-09'), NOW)).toBeNull() // exactly 30 days
    expect(validateRange(d('2030-01-10'), d('2030-02-10'), NOW)).toBe('error.tooLong')
    expect(MAX_DAYS).toBe(30)
  })
})

describe('quote', () => {
  it('prices days, extras and VAT in whole pounds', () => {
    const insurance = extras.find((e) => e.id === 'insurance')
    const q = quote({ pricePerDay: 900, days: 3, extras: [insurance] })
    expect(q).toEqual({ days: 3, base: 2700, extrasTotal: 600, subtotal: 3300, vat: 462, total: 3762 })
  })

  it('works without extras', () => {
    expect(quote({ pricePerDay: 700, days: 1 })).toEqual({ days: 1, base: 700, extrasTotal: 0, subtotal: 700, vat: 98, total: 798 })
  })

  it('returns zeros when there are no days', () => {
    expect(quote({ pricePerDay: 700, days: 0 }).total).toBe(0)
  })

  it('total is always subtotal plus VAT and a whole number', () => {
    for (const car of cars) {
      for (const days of [1, 2, 7, 30]) {
        const q = quote({ pricePerDay: car.priceEgp, days, extras })
        expect(q.total).toBe(q.subtotal + q.vat)
        expect(Number.isInteger(q.total)).toBe(true)
      }
    }
  })
})

describe('bookings helpers', () => {
  const a = { pickup: d('2030-01-10'), dropoff: d('2030-01-13') }
  it('detects overlapping ranges', () => {
    expect(overlaps(a, { pickup: d('2030-01-12'), dropoff: d('2030-01-15') })).toBe(true)
    expect(overlaps(a, { pickup: d('2030-01-09'), dropoff: d('2030-01-11') })).toBe(true)
    expect(overlaps(a, { pickup: d('2030-01-11'), dropoff: d('2030-01-12') })).toBe(true)
  })

  it('back-to-back bookings do not overlap', () => {
    expect(overlaps(a, { pickup: d('2030-01-13'), dropoff: d('2030-01-15') })).toBe(false)
    expect(overlaps(a, { pickup: d('2030-01-05'), dropoff: d('2030-01-10') })).toBe(false)
  })

  it('creates readable references', () => {
    const ref = makeReference(1_900_000_000_000, () => 0.5)
    expect(ref).toMatch(/^MSR-[0-9A-Z]{6}$/)
    expect(makeReference(1, () => 0.1)).not.toBe(makeReference(2, () => 0.1))
  })

  it('allows free cancellation until 24 hours before pick-up', () => {
    expect(canCancelFree(d('2030-01-03', '10:00'), new Date(2030, 0, 2, 10, 0))).toBe(true)
    expect(canCancelFree(d('2030-01-03', '10:00'), new Date(2030, 0, 2, 10, 1))).toBe(false)
  })
})

describe('catalog filters', () => {
  it('searches brand, name and type, ignoring case', () => {
    expect(filterCars(cars, { q: 'bmw' }).map((c) => c.id)).toEqual(['bmw-6-series', 'bmw-4-series'])
    expect(filterCars(cars, { q: '  CAMRY ' })).toHaveLength(1)
    expect(filterCars(cars, { q: 'zzz' })).toEqual([])
  })

  it('filters by type, seats, fuel and price together', () => {
    expect(filterCars(cars, { type: 'suv' }).map((c) => c.id)).toEqual(['mercedes-gls'])
    expect(filterCars(cars, { seats: 7 }).map((c) => c.id)).toEqual(['mercedes-gls'])
    expect(filterCars(cars, { fuel: 'electric' }).map((c) => c.id)).toEqual(['tesla-suv'])
    expect(filterCars(cars, { maxPrice: 1000 }).every((c) => c.priceEgp <= 1000)).toBe(true)
    expect(filterCars(cars, { type: 'coupe', maxPrice: 2400 }).map((c) => c.id).sort()).toEqual(['bmw-4-series', 'mercedes-c-coupe'])
  })

  it('sorts without changing the input', () => {
    const before = cars.map((c) => c.id)
    const asc = sortCars(cars, 'priceAsc').map((c) => c.priceEgp)
    expect(asc).toEqual([...asc].sort((x, y) => x - y))
    const desc = sortCars(cars, 'priceDesc').map((c) => c.priceEgp)
    expect(desc).toEqual([...desc].sort((x, y) => y - x))
    expect(sortCars(cars, 'rating')[0].rating).toBe(Math.max(...cars.map((c) => c.rating)))
    expect(cars.map((c) => c.id)).toEqual(before)
  })

  it('treats the URL as untrusted input', () => {
    const f = readFilters(new URLSearchParams('seats=abc&max=99999999&sort=hack&type=suv'), PRICE_MAX)
    expect(f).toMatchObject({ seats: 0, maxPrice: PRICE_MAX, sort: 'recommended', type: 'suv' })
    expect(readFilters(new URLSearchParams('max=-50'), PRICE_MAX).maxPrice).toBe(0)
    expect(readFilters(new URLSearchParams('seats=99'), PRICE_MAX).seats).toBe(9)
  })
})

describe('validation', () => {
  const booking = { name: 'Mona Ali', email: 'mona@example.com', phone: '010 1234 5678', pickupLocation: 'cai', dropoffLocation: 'nasr', payment: 'cash', accept: true }

  it('accepts a complete booking', () => {
    expect(validateBooking(booking)).toEqual({})
  })

  it('reports every missing field with a translation key', () => {
    expect(validateBooking({})).toEqual({
      name: 'error.name', email: 'error.email', phone: 'error.phone',
      pickupLocation: 'error.location', dropoffLocation: 'error.location', payment: 'error.payment', accept: 'error.accept',
    })
  })

  it('accepts Egyptian mobile formats and Arabic digits', () => {
    for (const p of ['01012345678', '010-1234-5678', '+201112345678', '201212345678', '٠١٠١٢٣٤٥٦٧٨']) expect(isEgyptianMobile(p), p).toBe(true)
    for (const p of ['01312345678', '0101234567', 'abc', '']) expect(isEgyptianMobile(p), p).toBe(false)
    expect(normalizePhone(' ٠١٠-12 ')).toBe('01012')
  })

  it('validates the contact form', () => {
    expect(validateContact({ name: 'Mona', email: 'mona@example.com', message: 'Do you have a car for Friday?' })).toEqual({})
    expect(validateContact({ name: '', email: 'x', message: 'short' })).toEqual({ name: 'error.name', email: 'error.email', message: 'error.message' })
  })
})

describe('catalog data', () => {
  it('has unique ids and every car has an image and a positive price', () => {
    expect(new Set(cars.map((c) => c.id)).size).toBe(cars.length)
    for (const c of cars) {
      expect(c.priceEgp).toBeGreaterThan(0)
      expect(c.colors.length).toBeGreaterThan(0)
      expect(c.rating).toBeGreaterThanOrEqual(1)
      expect(c.rating).toBeLessThanOrEqual(5)
    }
    expect(carById('nope')).toBeUndefined()
  })
})
