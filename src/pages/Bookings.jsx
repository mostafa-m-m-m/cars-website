import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LuCalendarX, LuCircleCheck } from 'react-icons/lu'
import { useSettings } from '../context/SettingsContext'
import { useBookings } from '../context/BookingsContext'
import { useMeta } from '../hooks/useMeta'
import { carById } from '../data/cars'
import { extras as allExtras, locations } from '../data/content'
import { canCancelFree } from '../lib/pricing'
import { CarImage, Dialog, PageHeader } from '../components/ui'

export default function Bookings() {
  const { t, tr, formatDate, formatTime, formatMoney, formatNumber } = useSettings()
  useMeta(t('meta.bookings.title'), t('meta.bookings.desc'))
  const { bookings, cancelBooking } = useBookings()
  const [params] = useSearchParams()
  const justBooked = params.get('ref')
  const [cancelling, setCancelling] = useState(null) // booking being cancelled

  const place = (id) => tr(locations.find((l) => l.id === id)?.name)

  return (
    <>
      <PageHeader title={t('nav.bookings')}>{t('bookings.intro')}</PageHeader>
      <section className="section container">
        {justBooked && bookings.some((b) => b.ref === justBooked) && (
          <div className="success-banner" role="status">
            <LuCircleCheck aria-hidden="true" size={28} />
            <div>
              <p><strong>{t('bookings.confirmed')}</strong></p>
              <p>{t('bookings.confirmedBody', { ref: justBooked })}</p>
              <p className="muted small">{t('demo.note')}</p>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="empty">
            <LuCalendarX size={40} aria-hidden="true" />
            <p>{t('bookings.empty')}</p>
            <Link to="/cars" className="btn">{t('bookings.browse')}</Link>
          </div>
        ) : (
          <ul className="bookings">
            {bookings.map((b) => {
              const car = carById(b.carId)
              const color = car?.colors.find((c) => c.id === b.colorId) ?? car?.colors[0]
              const cancelled = b.status === 'cancelled'
              return (
                <li key={b.ref} className={`booking-card ${cancelled ? 'booking-card--cancelled' : ''} ${b.ref === justBooked ? 'booking-card--new' : ''}`}>
                  {color && <CarImage color={color} className="booking-card__image" />}
                  <div className="booking-card__main">
                    <p className="muted small">{t('bookings.ref')}: <strong dir="ltr">{b.ref}</strong></p>
                    <h2>{b.carName}</h2>
                    <p className={`status status--${b.status}`}>{t(`status.${b.status}`)}</p>
                    <dl className="facts">
                      <div><dt>{t('booking.pickupDate')}</dt><dd>{formatDate(b.pickup)} · {formatTime(b.pickup)}<br /><span className="muted small">{place(b.pickupLocation)}</span></dd></div>
                      <div><dt>{t('booking.returnDate')}</dt><dd>{formatDate(b.dropoff)} · {formatTime(b.dropoff)}<br /><span className="muted small">{place(b.dropoffLocation)}</span></dd></div>
                      <div><dt>{t('bookings.days')}</dt><dd>{formatNumber(b.quote.days)}</dd></div>
                      <div><dt>{t('booking.total')}</dt><dd>{formatMoney(b.quote.total)}</dd></div>
                    </dl>
                    {b.extras.length > 0 && (
                      <p className="muted small">{t('booking.extras')}: {b.extras.map((id) => tr(allExtras.find((e) => e.id === id)?.name)).join(', ')}</p>
                    )}
                    {!cancelled && (
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => setCancelling(b)}>
                        {t('bookings.cancel')}<span className="sr-only"> {b.ref}</span>
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Dialog open={cancelling !== null} onClose={() => setCancelling(null)} title={t('bookings.cancelTitle')}>
        {cancelling && (
          <div className="form">
            <p>{t('bookings.cancelBody', { car: cancelling.carName, ref: cancelling.ref })}</p>
            <p className={canCancelFree(cancelling.pickup) ? 'muted' : 'alert'}>
              {canCancelFree(cancelling.pickup) ? t('bookings.freeCancel') : t('bookings.lateCancel')}
            </p>
            <div className="form__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setCancelling(null)}>{t('bookings.keep')}</button>
              <button type="button" className="btn btn--danger" onClick={() => { cancelBooking(cancelling.ref); setCancelling(null) }}>{t('bookings.confirmCancel')}</button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}
