import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useMeta } from '../hooks/useMeta'

export default function NotFound() {
  const { t } = useSettings()
  useMeta(t('notfound.title'))
  return (
    <section className="section container notfound">
      <p className="notfound__code" aria-hidden="true">404</p>
      <h1>{t('notfound.title')}</h1>
      <p className="muted">{t('notfound.body')}</p>
      <Link to="/cars" className="btn btn--lg">{t('notfound.cars')}</Link>
    </section>
  )
}
