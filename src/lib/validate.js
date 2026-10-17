// Form validation. Each validator returns { field: errorKey }; an empty object means valid.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Egyptian mobile numbers: 010, 011, 012, 015, optionally with +20 or 20 prefix.
const PHONE_EG = /^(?:\+?20|0)?1[0125]\d{8}$/

export const toLatinDigits = (value) =>
  value.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))

export const normalizePhone = (value) => toLatinDigits(value).replace(/[\s-]/g, '')

export const isEmail = (value) => EMAIL.test(value.trim())
export const isEgyptianMobile = (value) => PHONE_EG.test(normalizePhone(value))

export function validateContact({ name = '', email = '', message = '' }) {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'error.name'
  if (!isEmail(email)) errors.email = 'error.email'
  if (message.trim().length < 10) errors.message = 'error.message'
  return errors
}

export function validateBooking({ name = '', email = '', phone = '', pickupLocation = '', dropoffLocation = '', payment = '', accept = false }) {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'error.name'
  if (!isEmail(email)) errors.email = 'error.email'
  if (!isEgyptianMobile(phone)) errors.phone = 'error.phone'
  if (!pickupLocation) errors.pickupLocation = 'error.location'
  if (!dropoffLocation) errors.dropoffLocation = 'error.location'
  if (!payment) errors.payment = 'error.payment'
  if (!accept) errors.accept = 'error.accept'
  return errors
}
