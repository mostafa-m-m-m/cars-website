import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LuCalendarDays, LuChevronLeft, LuChevronRight, LuFuel, LuMapPin, LuMinus, LuPhone, LuPlane, LuPlus, LuRoute,
  LuStar, LuTag, LuUsers, LuX, LuZap, LuQuote, LuBriefcase,
} from 'react-icons/lu'
import { useSettings } from '../context/SettingsContext'
import { img } from '../data/images'

const SERVICE_ICONS = { plane: LuPlane, tag: LuTag, pin: LuMapPin, road: LuRoute, phone: LuPhone, calendar: LuCalendarDays }
export function ServiceIcon({ name }) {
  const Icon = SERVICE_ICONS[name] ?? LuTag
  return <Icon aria-hidden="true" />
}

export function PageHeader({ title, children }) {
  return (
    <section className="page-header">
      <div className="container">
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </section>
  )
}

export function SectionHeader({ id, title, children }) {
  return (
    <div className="section-head">
      <h2 id={id}>{title}</h2>
      {children && <p className="muted">{children}</p>}
    </div>
  )
}

export function Stars({ rating, reviews }) {
  const { t, formatRating, formatNumber } = useSettings()
  return (
    <span className="stars" role="img" aria-label={t('car.ratingLabel', { rating: formatRating(rating), n: formatNumber(reviews) })}>
      <LuStar aria-hidden="true" fill="currentColor" />
      <strong>{formatRating(rating)}</strong>
      <span className="muted small">({formatNumber(reviews)})</span>
    </span>
  )
}

export function CarImage({ color, alt = '', eager = false, className = '' }) {
  return (
    <div className={`car-image car-image--${color.kind} ${className}`}>
      <img src={img(color.image)} alt={alt} width="800" height={color.kind === 'cutout' ? 426 : 600} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" />
    </div>
  )
}

export function Specs({ car }) {
  const { t, formatNumber } = useSettings()
  return (
    <ul className="specs">
      <li><LuUsers aria-hidden="true" /> <span>{t('car.seats', { n: formatNumber(car.seats) })}</span></li>
      <li><LuBriefcase aria-hidden="true" /> <span>{t('car.bags', { n: formatNumber(car.bags) })}</span></li>
      <li>{car.fuel === 'electric' ? <LuZap aria-hidden="true" /> : <LuFuel aria-hidden="true" />} <span>{t(`fuel.${car.fuel}`)}</span></li>
    </ul>
  )
}

export function CarCard({ car, search = '', total, days, level = 3, priority = false }) {
  const Heading = `h${level}`
  const { t, formatMoney, formatNumber } = useSettings()
  return (
    <article className="car-card">
      <Link to={`/cars/${car.id}${search}`} className="car-card__media" tabIndex={-1} aria-hidden="true">
        <CarImage color={car.colors[0]} eager={priority} />
      </Link>
      <div className="car-card__body">
        <p className="muted small">{t(`type.${car.type}`)} · {car.year}</p>
        <Heading className="car-card__title"><Link to={`/cars/${car.id}${search}`}>{car.name}</Link></Heading>
        <Stars rating={car.rating} reviews={car.reviews} />
        <Specs car={car} />
        <div className="car-card__foot">
          <p className="price">
            <strong>{formatMoney(car.priceEgp)}</strong> <span className="muted small">/ {t('common.day')}</span>
            {total ? <span className="muted small price__total">{t('car.totalFor', { total: formatMoney(total), n: formatNumber(days) })}</span> : null}
          </p>
          <Link to={`/cars/${car.id}${search}`} className="btn btn--small">
            {t('car.book')}<span className="sr-only"> {car.name}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

export function FaqList({ items }) {
  const { tr } = useSettings()
  const [openId, setOpenId] = useState(null)
  const base = useId()
  return (
    <div className="faq-list">
      {items.map((item) => {
        const open = openId === item.id
        return (
          <div key={item.id} className={`faq ${open ? 'faq--open' : ''}`}>
            <h3>
              <button type="button" aria-expanded={open} aria-controls={`${base}-${item.id}`} id={`${base}-${item.id}-btn`} onClick={() => setOpenId(open ? null : item.id)}>
                <span>{tr(item.q)}</span>
                {open ? <LuMinus aria-hidden="true" /> : <LuPlus aria-hidden="true" />}
              </button>
            </h3>
            <div id={`${base}-${item.id}`} role="region" aria-labelledby={`${base}-${item.id}-btn`} hidden={!open}>
              <p>{tr(item.a)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Testimonials({ items }) {
  const { t, tr, lang, formatNumber } = useSettings()
  const [index, setIndex] = useState(0)
  const item = items[index]
  const go = (delta) => setIndex((i) => (i + delta + items.length) % items.length)
  const rtl = lang === 'ar'
  return (
    <div className="testimonials" role="group" aria-roledescription="carousel" aria-label={t('home.reviews')}>
      <figure className="testimonial">
        <img className="testimonial__avatar" src={img(item.avatar)} alt="" width="88" height="88" loading="lazy" />
        <LuQuote className="testimonial__icon" aria-hidden="true" />
        <div aria-live="polite" aria-atomic="true">
          <blockquote>{tr(item.quote)}</blockquote>
          <figcaption>
            <strong>{tr(item.name)}</strong>
            <span className="muted small">{tr(item.role)}</span>
          </figcaption>
        </div>
      </figure>
      <div className="testimonials__controls">
        <button type="button" className="icon-btn icon-btn--solid" aria-label={t('common.prev')} onClick={() => go(-1)}>
          {rtl ? <LuChevronRight aria-hidden="true" /> : <LuChevronLeft aria-hidden="true" />}
        </button>
        <span className="small muted" aria-hidden="true">{t('common.counter', { n: formatNumber(index + 1), total: formatNumber(items.length) })}</span>
        <button type="button" className="icon-btn icon-btn--solid" aria-label={t('common.next')} onClick={() => go(1)}>
          {rtl ? <LuChevronLeft aria-hidden="true" /> : <LuChevronRight aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

// Native <dialog>: focus trap, Escape and top layer for free. Closes on backdrop click.
export function Dialog({ open, onClose, title, children }) {
  const ref = useRef(null)
  const titleId = useId()
  const { t } = useSettings()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="dialog" aria-labelledby={titleId} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      {open && (
        <div className="dialog__body">
          <div className="dialog__head">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="icon-btn" aria-label={t('common.close')} onClick={onClose}>
              <LuX aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

export function Field({ id, label, error, hint, children }) {
  const { t } = useSettings()
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy })}
      {hint && <p id={`${id}-hint`} className="field__hint muted small">{hint}</p>}
      {error && <p id={`${id}-error`} className="field__error" role="alert">{t(error)}</p>}
    </div>
  )
}
