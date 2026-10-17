import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useMeta } from '../hooks/useMeta'
import { img } from '../data/images'
import { cars } from '../data/cars'
import { faqs, locations } from '../data/content'
import { FaqList, PageHeader, SectionHeader } from '../components/ui'

export default function About() {
  const { t, formatNumber } = useSettings()
  useMeta(t('meta.about.title'), t('meta.about.desc'))
  const stats = [
    [cars.length, t('about.stats.cars')],
    [locations.length, t('about.stats.locations')],
    [24, t('about.stats.support')],
  ]
  return (
    <>
      <PageHeader title={t('nav.about')}>{t('about.intro')}</PageHeader>
      <section className="section container about">
        <img src={img('drive')} alt="" width="1000" height="667" loading="lazy" />
        <div>
          <h2>{t('about.title')}</h2>
          <p>{t('about.p1')}</p>
          <p className="muted">{t('about.p2')}</p>
          <p><Link to="/cars" className="btn">{t('home.allCars')}</Link></p>
        </div>
      </section>
      <section className="stats container" aria-label={t('about.stats.label')}>
        {stats.map(([n, label]) => (
          <div key={label} className="stat">
            <p className="stat__n">{formatNumber(n)}</p>
            <p className="muted">{label}</p>
          </div>
        ))}
      </section>
      <section className="section container" aria-labelledby="faq-title">
        <SectionHeader id="faq-title" title={t('about.faq')}>{t('about.faqIntro')}</SectionHeader>
        <FaqList items={faqs} />
      </section>
    </>
  )
}
