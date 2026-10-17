import { Link, useParams } from 'react-router-dom'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'
import { useSettings } from '../context/SettingsContext'
import { useMeta } from '../hooks/useMeta'
import { img } from '../data/images'
import { postById, posts } from '../data/content'
import { PageHeader } from '../components/ui'
import NotFound from './NotFound'

export function Blog() {
  const { t, tr, formatLongDate } = useSettings()
  useMeta(t('meta.blog.title'), t('meta.blog.desc'))
  return (
    <>
      <PageHeader title={t('nav.blog')}>{t('blog.intro')}</PageHeader>
      <section className="section container">
        <div className="grid grid--3">
          {posts.map((p) => (
            <article key={p.id} className="post-card">
              <Link to={`/blog/${p.id}`} tabIndex={-1} aria-hidden="true"><img src={img(p.image)} alt="" width="870" height="580" loading="lazy" /></Link>
              <div className="post-card__body">
                <p className="muted small">{formatLongDate(new Date(p.date))} · {t('blog.minutes', { n: p.minutes })}</p>
                <h2><Link to={`/blog/${p.id}`}>{tr(p.title)}</Link></h2>
                <p className="muted">{tr(p.excerpt)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export function BlogPost() {
  const { id } = useParams()
  const { t, tr, lang, formatLongDate } = useSettings()
  const post = postById(id)
  useMeta(post ? `${tr(post.title)} | ${t('brand.name')}` : t('notfound.title'), post ? tr(post.excerpt) : undefined)
  if (!post) return <NotFound />
  const Back = lang === 'ar' ? LuArrowRight : LuArrowLeft
  return (
    <article className="container article">
      <Link to="/blog" className="back-link"><Back aria-hidden="true" /> {t('blog.back')}</Link>
      <p className="muted small">{formatLongDate(new Date(post.date))} · {t('blog.minutes', { n: post.minutes })}</p>
      <h1>{tr(post.title)}</h1>
      <img className="article__image" src={img(post.image)} alt="" width="870" height="580" fetchPriority="high" />
      {post.body.map((paragraph, i) => <p key={i}>{tr(paragraph)}</p>)}
      <p><Link to="/cars" className="btn">{t('blog.cta')}</Link></p>
    </article>
  )
}
