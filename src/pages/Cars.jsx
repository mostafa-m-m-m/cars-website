import { useSearchParams } from 'react-router-dom'
import { LuCarFront } from 'react-icons/lu'
import { useSettings } from '../context/SettingsContext'
import { useMeta } from '../hooks/useMeta'
import { cars, PRICE_MAX, TYPES } from '../data/cars'
import { filterCars, readFilters, SORTS, sortCars } from '../lib/filters'
import { quote, rentalDays, toDate } from '../lib/pricing'
import { CarCard, PageHeader } from '../components/ui'

export default function Cars() {
  const { t, formatMoney, formatNumber } = useSettings()
  useMeta(t('meta.cars.title'), t('meta.cars.desc'))
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params, PRICE_MAX)

  // Dates chosen on the home page travel in the URL so prices can show a total.
  const from = params.get('from')
  const to = params.get('to')
  const days = rentalDays(toDate(from, '10:00'), toDate(to, '10:00'))
  const carryOver = ['from', 'to', 'pl'].filter((k) => params.get(k)).map((k) => `${k}=${encodeURIComponent(params.get(k))}`).join('&')

  const update = (key, value, empty) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === empty || value === '') next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )

  const results = sortCars(filterCars(cars, filters), filters.sort)
  const active = ['q', 'type', 'fuel', 'seats', 'max'].some((k) => params.get(k))

  return (
    <>
      <PageHeader title={t('nav.cars')}>{t('cars.intro')}</PageHeader>
      <section className="section container">
        <form className="filters" role="search" onSubmit={(e) => e.preventDefault()} aria-label={t('filters.label')}>
          <div className="field field--wide">
            <label htmlFor="f-q">{t('filters.search')}</label>
            <input id="f-q" type="search" value={filters.q} placeholder={t('filters.searchPlaceholder')} onChange={(e) => update('q', e.target.value, '')} />
          </div>
          <div className="field">
            <label htmlFor="f-type">{t('filters.type')}</label>
            <select id="f-type" value={filters.type} onChange={(e) => update('type', e.target.value, 'all')}>
              <option value="all">{t('filters.anyType')}</option>
              {TYPES.map((x) => <option key={x} value={x}>{t(`type.${x}`)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-seats">{t('filters.seats')}</label>
            <select id="f-seats" value={String(filters.seats)} onChange={(e) => update('seats', e.target.value, '0')}>
              <option value="0">{t('filters.anySeats')}</option>
              {[4, 5, 7].map((n) => <option key={n} value={n}>{t('filters.seatsMin', { n: formatNumber(n) })}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-fuel">{t('filters.fuel')}</label>
            <select id="f-fuel" value={filters.fuel} onChange={(e) => update('fuel', e.target.value, 'all')}>
              <option value="all">{t('filters.anyFuel')}</option>
              <option value="petrol">{t('fuel.petrol')}</option>
              <option value="electric">{t('fuel.electric')}</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-max">{t('filters.maxPrice', { price: formatMoney(filters.maxPrice) })}</label>
            <input id="f-max" type="range" min="500" max={PRICE_MAX} step="100" value={Math.max(filters.maxPrice, 500)} onChange={(e) => update('max', e.target.value, String(PRICE_MAX))} />
          </div>
          <div className="field">
            <label htmlFor="f-sort">{t('filters.sort')}</label>
            <select id="f-sort" value={filters.sort} onChange={(e) => update('sort', e.target.value, 'recommended')}>
              {SORTS.map((s) => <option key={s} value={s}>{t(`sort.${s}`)}</option>)}
            </select>
          </div>
          {active && (
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setParams(carryOver ? new URLSearchParams(carryOver) : {}, { replace: true })}>
              {t('filters.clear')}
            </button>
          )}
        </form>

        {days > 0 && <p className="notice">{t('cars.dates', { n: formatNumber(days) })}</p>}
        <p className="muted" role="status" aria-live="polite">{t('cars.count', { n: formatNumber(results.length) })}</p>

        {results.length === 0 ? (
          <div className="empty">
            <LuCarFront size={40} aria-hidden="true" />
            <p>{t('cars.empty')}</p>
          </div>
        ) : (
          <div className="grid grid--3">
            {results.map((car, index) => (
              <CarCard key={car.id} car={car} level={2} priority={index < 3} search={carryOver ? `?${carryOver}` : ''} days={days} total={days ? quote({ pricePerDay: car.priceEgp, days }).total : 0} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
