import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LuArrowLeft, LuArrowRight, LuCheck } from 'react-icons/lu'
import { useSettings } from '../context/SettingsContext'
import { useBookings } from '../context/BookingsContext'
import { useMeta } from '../hooks/useMeta'
import { carById } from '../data/cars'
import { extras as allExtras, locations } from '../data/content'
import { quote, rentalDays, toDate, validateRange, VAT_RATE } from '../lib/pricing'
import { toISODate } from '../lib/dates'
import { validateBooking } from '../lib/validate'
import { CarImage, Field, Specs, Stars } from '../components/ui'
import NotFound from './NotFound'

const PAYMENTS = ['cash', 'card', 'transfer']
const ORDER = ['pickupDate', 'returnDate', 'pickupLocation', 'dropoffLocation', 'name', 'email', 'phone', 'payment', 'accept']

export default function CarDetail() {
  const { id } = useParams()
  const car = carById(id)
  const { t, tr } = useSettings()
  useMeta(car ? `${car.name} | ${t('brand.name')}` : t('notfound.title'), car ? tr(car.description) : undefined)
  if (!car) return <NotFound />
  return <Detail car={car} />
}

function Detail({ car }) {
  const { t, tr, lang, formatMoney, formatNumber } = useSettings()
  const { addBooking, hasConflict } = useBookings()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const today = toISODate(new Date())

  const [colorId, setColorId] = useState(car.colors[0].id)
  const color = car.colors.find((c) => c.id === colorId) ?? car.colors[0]
  const [form, setForm] = useState({
    pickupDate: params.get('from') ?? '',
    pickupTime: '10:00',
    returnDate: params.get('to') ?? '',
    returnTime: '10:00',
    pickupLocation: locations.some((l) => l.id === params.get('pl')) ? params.get('pl') : '',
    dropoffLocation: '',
    name: '',
    email: '',
    phone: '',
    payment: '',
    accept: false,
  })
  const [chosen, setChosen] = useState(() => new Set())
  const [submitted, setSubmitted] = useState(false)
  const [conflict, setConflict] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const toggleExtra = (extraId) =>
    setChosen((s) => {
      const next = new Set(s)
      if (next.has(extraId)) next.delete(extraId)
      else next.add(extraId)
      return next
    })

  const pickup = toDate(form.pickupDate, form.pickupTime)
  const dropoff = toDate(form.returnDate, form.returnTime)
  const rangeError = validateRange(pickup, dropoff, new Date())
  const days = rentalDays(pickup, dropoff)
  const selectedExtras = allExtras.filter((e) => chosen.has(e.id))
  const price = quote({ pricePerDay: car.priceEgp, days: rangeError ? 0 : days, extras: selectedExtras })

  const fieldErrors = validateBooking(form)
  const errors = submitted
    ? {
        ...fieldErrors,
        ...(rangeError === 'error.pickup' || rangeError === 'error.pastPickup' ? { pickupDate: rangeError } : {}),
        ...(rangeError && rangeError !== 'error.pickup' && rangeError !== 'error.pastPickup' ? { returnDate: rangeError } : {}),
      }
    : {}

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    const all = { ...fieldErrors }
    if (rangeError === 'error.pickup' || rangeError === 'error.pastPickup') all.pickupDate = rangeError
    else if (rangeError) all.returnDate = rangeError
    const first = ORDER.find((k) => all[k])
    if (first) {
      document.getElementById(`bk-${first}`)?.focus()
      return
    }
    if (hasConflict(car.id, pickup, dropoff)) {
      setConflict(true)
      document.getElementById('bk-conflict')?.focus()
      return
    }
    const ref = addBooking({
      carId: car.id,
      carName: car.name,
      colorId,
      pickup,
      dropoff,
      pickupLocation: form.pickupLocation,
      dropoffLocation: form.dropoffLocation,
      extras: [...chosen],
      quote: price,
      payment: form.payment,
      customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
    })
    navigate(`/bookings?ref=${ref}`)
  }

  const Back = lang === 'ar' ? LuArrowRight : LuArrowLeft

  return (
    <div className="container detail">
      <Link to={`/cars${params.toString() ? `?${params}` : ''}`} className="back-link"><Back aria-hidden="true" /> {t('car.back')}</Link>

      <div className="detail__grid">
        <section aria-labelledby="car-title">
          <CarImage color={color} alt={`${car.name}, ${tr(color.label)}`} eager className="detail__image" />
          {car.colors.length > 1 && (
            <fieldset className="swatches">
              <legend>{t('car.color')}</legend>
              {car.colors.map((c) => (
                <label key={c.id} className={`swatch ${c.id === colorId ? 'swatch--on' : ''}`}>
                  <input type="radio" name="color" value={c.id} checked={c.id === colorId} onChange={() => setColorId(c.id)} />
                  <span>{tr(c.label)}</span>
                </label>
              ))}
            </fieldset>
          )}
          <p className="muted small">{t(`type.${car.type}`)} · {car.year} · {tr(color.label)}</p>
          <h1 id="car-title">{car.name}</h1>
          <Stars rating={car.rating} reviews={car.reviews} />
          <p className="detail__price"><strong>{formatMoney(car.priceEgp)}</strong> <span className="muted">/ {t('common.day')}</span></p>
          <p className="detail__text">{tr(car.description)}</p>
          <Specs car={car} />
          <h2 className="detail__sub">{t('car.features')}</h2>
          <ul className="checklist">
            {car.features.map((feat, i) => <li key={i}><LuCheck aria-hidden="true" /> {tr(feat)}</li>)}
          </ul>
        </section>

        <aside className="booking" aria-labelledby="booking-title">
          <form onSubmit={submit} noValidate>
            <h2 id="booking-title">{t('booking.title')}</h2>

            {conflict && (
              <p id="bk-conflict" className="alert" role="alert" tabIndex={-1}>{t('error.overlap')}</p>
            )}

            <div className="form-grid">
              <Field id="bk-pickupDate" label={t('booking.pickupDate')} error={errors.pickupDate}>
                {(a) => <input {...a} type="date" value={form.pickupDate} min={today} onChange={(e) => { set('pickupDate')(e); setConflict(false) }} />}
              </Field>
              <Field id="bk-pickupTime" label={t('booking.pickupTime')}>
                {(a) => <input {...a} type="time" value={form.pickupTime} onChange={set('pickupTime')} />}
              </Field>
              <Field id="bk-returnDate" label={t('booking.returnDate')} error={errors.returnDate}>
                {(a) => <input {...a} type="date" value={form.returnDate} min={form.pickupDate || today} onChange={(e) => { set('returnDate')(e); setConflict(false) }} />}
              </Field>
              <Field id="bk-returnTime" label={t('booking.returnTime')}>
                {(a) => <input {...a} type="time" value={form.returnTime} onChange={set('returnTime')} />}
              </Field>
              <Field id="bk-pickupLocation" label={t('booking.pickupLocation')} error={errors.pickupLocation}>
                {(a) => (
                  <select {...a} value={form.pickupLocation} onChange={set('pickupLocation')}>
                    <option value="">{t('booking.chooseLocation')}</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{tr(l.name)}</option>)}
                  </select>
                )}
              </Field>
              <Field id="bk-dropoffLocation" label={t('booking.dropoffLocation')} error={errors.dropoffLocation}>
                {(a) => (
                  <select {...a} value={form.dropoffLocation} onChange={set('dropoffLocation')}>
                    <option value="">{t('booking.chooseLocation')}</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{tr(l.name)}</option>)}
                  </select>
                )}
              </Field>
            </div>

            <fieldset className="options">
              <legend>{t('booking.extras')}</legend>
              {allExtras.map((e) => (
                <label key={e.id} className="check">
                  <input type="checkbox" checked={chosen.has(e.id)} onChange={() => toggleExtra(e.id)} />
                  <span>{tr(e.name)}</span>
                  <span className="muted small">{formatMoney(e.priceEgp)} / {t('common.day')}</span>
                </label>
              ))}
            </fieldset>

            <div className="form-grid">
              <Field id="bk-name" label={t('form.name')} error={errors.name}>
                {(a) => <input {...a} type="text" autoComplete="name" value={form.name} onChange={set('name')} />}
              </Field>
              <Field id="bk-phone" label={t('form.phone')} error={errors.phone} hint={t('form.phoneHint')}>
                {(a) => <input {...a} type="tel" autoComplete="tel" inputMode="tel" dir="ltr" value={form.phone} onChange={set('phone')} />}
              </Field>
            </div>
            <Field id="bk-email" label={t('form.email')} error={errors.email}>
              {(a) => <input {...a} type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} />}
            </Field>

            <fieldset className={`options ${errors.payment ? 'options--error' : ''}`} aria-describedby={errors.payment ? 'bk-payment-error' : undefined}>
              <legend>{t('booking.payment')}</legend>
              {PAYMENTS.map((p, i) => (
                <label key={p} className="check">
                  <input id={i === 0 ? 'bk-payment' : undefined} type="radio" name="payment" value={p} checked={form.payment === p} onChange={set('payment')} />
                  <span>{t(`payment.${p}`)}</span>
                </label>
              ))}
              <p className="muted small">{t('booking.noCard')}</p>
              {errors.payment && <p id="bk-payment-error" className="field__error" role="alert">{t(errors.payment)}</p>}
            </fieldset>

            <div className="summary" aria-live="polite" aria-label={t('booking.summary')}>
              <h3>{t('booking.summary')}</h3>
              {price.days === 0 ? (
                <p className="muted">{t('booking.pickDates')}</p>
              ) : (
                <dl>
                  <div><dt>{t('booking.base', { price: formatMoney(car.priceEgp), n: formatNumber(price.days) })}</dt><dd>{formatMoney(price.base)}</dd></div>
                  {selectedExtras.map((e) => (
                    <div key={e.id}><dt>{tr(e.name)} × {formatNumber(price.days)}</dt><dd>{formatMoney(e.priceEgp * price.days)}</dd></div>
                  ))}
                  <div><dt>{t('booking.vat', { rate: formatNumber(VAT_RATE * 100) })}</dt><dd>{formatMoney(price.vat)}</dd></div>
                  <div className="summary__total"><dt>{t('booking.total')}</dt><dd>{formatMoney(price.total)}</dd></div>
                </dl>
              )}
            </div>

            <div className={`field ${errors.accept ? 'field--error' : ''}`}>
              <label className="check">
                <input id="bk-accept" type="checkbox" checked={form.accept} onChange={set('accept')} aria-invalid={errors.accept ? 'true' : undefined} aria-describedby={errors.accept ? 'bk-accept-error' : undefined} />
                <span>{t('booking.accept')}</span>
              </label>
              {errors.accept && <p id="bk-accept-error" className="field__error" role="alert">{t(errors.accept)}</p>}
            </div>

            <p className="muted small">{t('demo.note')}</p>
            <button type="submit" className="btn btn--lg btn--block">{t('booking.reserve')}</button>
          </form>
        </aside>
      </div>
    </div>
  )
}
