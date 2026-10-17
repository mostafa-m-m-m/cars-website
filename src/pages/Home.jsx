import { Link } from 'react-router-dom'
import { LuArrowRight, LuArrowLeft } from 'react-icons/lu'
import { useSettings } from '../context/SettingsContext'
import { useMeta } from '../hooks/useMeta'
import { img } from '../data/images'
import { cars } from '../data/cars'
import { posts, services, testimonials } from '../data/content'
import { sortCars } from '../lib/filters'
import FindCarForm from '../components/FindCarForm'
import { CarCard, SectionHeader, ServiceIcon, Testimonials } from '../components/ui'

export default function Home() {
  const { t, tr, lang, formatLongDate } = useSettings()
  useMeta(t('meta.home.title'), t('meta.home.desc'))
  const featured = sortCars(cars, 'rating').slice(0, 3)
  const Arrow = lang === 'ar' ? LuArrowLeft : LuArrowRight

  return (
    <>
      <section className="hero">
        <img className="hero__bg" src={img('drive')} alt="" width="1000" height="667" fetchPriority="high" />
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="hero__tag">{t('hero.tag')}</p>
            <h1>{t('hero.title')}</h1>
            <p className="hero__lead">{t('hero.lead')}</p>
          </div>
          <FindCarForm />
        </div>
      </section>

      <section className="section container" aria-labelledby="featured-title">
        <SectionHeader id="featured-title" title={t('home.featured')}>{t('home.featuredIntro')}</SectionHeader>
        <div className="grid grid--3">
          {featured.map((car) => <CarCard key={car.id} car={car} priority />)}
        </div>
        <p className="section__more"><Link to="/cars" className="btn btn--ghost">{t('home.allCars')} <Arrow aria-hidden="true" /></Link></p>
      </section>

      <section className="section section--tint" aria-labelledby="services-title">
        <div className="container">
          <SectionHeader id="services-title" title={t('home.services')}>{t('home.servicesIntro')}</SectionHeader>
          <div className="grid grid--3">
            {services.map((s) => (
              <article key={s.id} className="service">
                <span className="service__icon"><ServiceIcon name={s.icon} /></span>
                <h3>{tr(s.title)}</h3>
                <p className="muted">{tr(s.text)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="reviews-title">
        <SectionHeader id="reviews-title" title={t('home.reviews')}>{t('home.reviewsNote')}</SectionHeader>
        <Testimonials items={testimonials} />
      </section>

      <section className="section container" aria-labelledby="blog-title">
        <SectionHeader id="blog-title" title={t('home.blog')}>{t('home.blogIntro')}</SectionHeader>
        <div className="grid grid--3">
          {posts.map((p) => (
            <article key={p.id} className="post-card">
              <Link to={`/blog/${p.id}`} tabIndex={-1} aria-hidden="true"><img src={img(p.image)} alt="" width="870" height="580" loading="lazy" /></Link>
              <div className="post-card__body">
                <p className="muted small">{formatLongDate(new Date(p.date))} · {t('blog.minutes', { n: p.minutes })}</p>
                <h3><Link to={`/blog/${p.id}`}>{tr(p.title)}</Link></h3>
                <p className="muted">{tr(p.excerpt)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
