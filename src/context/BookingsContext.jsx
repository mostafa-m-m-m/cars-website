import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { makeReference, overlaps } from '../lib/pricing'

const KEY = 'masar.bookings'
const BookingsContext = createContext(null)

// Dates are stored as ISO strings and revived to Date objects on read.
const revive = (b) => ({ ...b, pickup: new Date(b.pickup), dropoff: new Date(b.dropoff) })

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw.map(revive) : []
  } catch {
    return []
  }
}

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(bookings))
    } catch {
      // storage unavailable: bookings live in memory for this session
    }
  }, [bookings])

  // Another tab changed the bookings: stay in sync.
  useEffect(() => {
    const onStorage = (e) => e.key === KEY && setBookings(read())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const hasConflict = useCallback(
    (carId, pickup, dropoff) => bookings.some((b) => b.carId === carId && b.status === 'confirmed' && overlaps(b, { pickup, dropoff })),
    [bookings],
  )

  const addBooking = useCallback((data) => {
    const booking = { ...data, ref: makeReference(), status: 'confirmed', createdAt: new Date().toISOString() }
    setBookings((list) => [booking, ...list])
    return booking.ref
  }, [])

  const cancelBooking = useCallback((ref) => {
    setBookings((list) => list.map((b) => (b.ref === ref ? { ...b, status: 'cancelled' } : b)))
  }, [])

  const value = useMemo(() => ({ bookings, addBooking, cancelBooking, hasConflict }), [bookings, addBooking, cancelBooking, hasConflict])
  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>
}

export function useBookings() {
  const ctx = useContext(BookingsContext)
  if (!ctx) throw new Error('useBookings must be used inside BookingsProvider')
  return ctx
}
