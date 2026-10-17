import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuSearch } from 'react-icons/lu'
import { useSettings } from '../context/SettingsContext'
import { locations } from '../data/content'
import { TYPES } from '../data/cars'
import { toDate, validateRange } from '../lib/pricing'
import { addDays, toISODate } from '../lib/dates'
import { Field } from './ui'

// Hero search: validates the dates, then opens the catalog with them in the URL.
export default function FindCarForm() {
  const { t, tr } = useSettings()
  const navigate = useNavigate()
  const today = new Date()
  const [values, setValues] = useState({
    location: 'cai',
    from: toISODate(addDays(today, 1)),
    to: toISODate(addDays(today, 4)),
    type: 'all',
  })
  const [error, setError] = useState(null)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const problem = validateRange(toDate(values.from, '10:00'), toDate(values.to, '10:00'), new Date())
    setError(problem)
    if (problem) {
      document.getElementById('find-from')?.focus()
      return
    }
    const params = new URLSearchParams({ from: values.from, to: values.to, pl: values.location })
    if (values.type !== 'all') params.set('type', values.type)
    navigate(`/cars?${params}`)
  }

  return (
    <form className="find" onSubmit={submit} noValidate aria-label={t('find.title')}>
      <h2 className="find__title">{t('find.title')}</h2>
      <div className="find__grid">
        <Field id="find-location" label={t('find.pickup')}>
          {(a) => (
            <select {...a} value={values.location} onChange={set('location')}>
              {locations.map((l) => <option key={l.id} value={l.id}>{tr(l.name)}</option>)}
            </select>
          )}
        </Field>
        <Field id="find-from" label={t('find.from')} error={error === 'error.pickup' || error === 'error.pastPickup' ? error : null}>
          {(a) => <input {...a} type="date" value={values.from} min={toISODate(today)} onChange={set('from')} />}
        </Field>
        <Field id="find-to" label={t('find.to')} error={error && error !== 'error.pickup' && error !== 'error.pastPickup' ? error : null}>
          {(a) => <input {...a} type="date" value={values.to} min={values.from} onChange={set('to')} />}
        </Field>
        <Field id="find-type" label={t('find.type')}>
          {(a) => (
            <select {...a} value={values.type} onChange={set('type')}>
              <option value="all">{t('filters.anyType')}</option>
              {TYPES.map((x) => <option key={x} value={x}>{t(`type.${x}`)}</option>)}
            </select>
          )}
        </Field>
        <button type="submit" className="btn btn--lg find__submit">
          <LuSearch aria-hidden="true" /> {t('find.submit')}
        </button>
      </div>
    </form>
  )
}
