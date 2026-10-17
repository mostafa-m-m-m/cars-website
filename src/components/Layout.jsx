import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LuLanguages, LuMail, LuMapPin, LuMenu, LuMoon, LuPhone, LuSun, LuX } from 'react-icons/lu'
import { useSettings } from '../context/SettingsContext'
import { useBookings } from '../context/BookingsContext'

const LINKS = [
  ['/', 'nav.home', true],
  ['/cars', 'nav.cars'],
  ['/blog', 'nav.blog'],
  ['/about', 'nav.about'],
  ['/contact', 'nav.contact'],
]

function Logo() {
  const { t } = useSettings()
  return (
    <Link to="/" className="logo" aria-label={t('brand.name')}>
      <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#f9a826" />
        <path d="M7 27l3.5-9c.6-1.6 1.800-2.400 3.500-2.400h12c1.700 0 2.900.8 3.500 2.400L33 27v4h-3.500v-2.500h-19V31H7z" fill="#000d6b" />
        <circle cx="13" cy="25.500" r="2" fill="#f9a826" />
        <circle cx="27" cy="25.500" r="2" fill="#f9a826" />
      </svg>
      <span>{t('brand.name')}</span>
    </Link>
  )
}

function Navbar() {
  const { t, lang, setLang, theme, setTheme } = useSettings()
  const { bookings } = useBookings()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const [lastPath, setLastPath] = useState(pathname)
  const active = bookings.filter((b) => b.status === 'confirmed').length

  // Close the mobile menu after navigating (adjusting state while rendering, not in an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Logo />
        <nav id="site-nav" aria-label={t('nav.label')} className={`nav__links ${open ? 'nav__links--open' : ''}`}>
          <ul>
            {LINKS.map(([to, key, end]) => (
              <li key={to}><NavLink to={to} end={end}>{t(key)}</NavLink></li>
            ))}
            <li>
              <NavLink to="/bookings">
                {t('nav.bookings')}
                {active > 0 && <span className="badge" aria-label={t('nav.activeBookings', { n: active })}>{active}</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="nav__tools">
          <button type="button" className="icon-btn" aria-label={`${t('theme.toggle')}: ${theme === 'dark' ? t('theme.dark') : t('theme.light')}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <LuMoon aria-hidden="true" /> : <LuSun aria-hidden="true" />}
          </button>
          <button type="button" className="lang-btn" aria-label={`${t('lang.toggle')}: ${lang === 'ar' ? 'English' : 'العربية'}`} onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
            <LuLanguages aria-hidden="true" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          <button type="button" className="icon-btn nav__toggle" aria-expanded={open} aria-controls="site-nav" aria-label={open ? t('nav.close') : t('nav.open')} onClick={() => setOpen((o) => !o)}>
            {open ? <LuX aria-hidden="true" /> : <LuMenu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const { t } = useSettings()
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__brand">{t('brand.name')}</p>
          <p className="footer__text">{t('footer.about')}</p>
        </div>
        <div>
          <h2 className="footer__title">{t('footer.explore')}</h2>
          <ul className="footer__list">
            {LINKS.slice(1).map(([to, key]) => <li key={to}><Link to={to}>{t(key)}</Link></li>)}
            <li><Link to="/bookings">{t('nav.bookings')}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer__title">{t('footer.contact')}</h2>
          <ul className="footer__list footer__list--icons">
            <li><LuMapPin aria-hidden="true" /> {t('contact.address')}</li>
            <li><LuPhone aria-hidden="true" /> <a href="tel:+201000000000" dir="ltr">+20 100 000 0000</a></li>
            <li><LuMail aria-hidden="true" /> <a href="mailto:hello@masar.example">hello@masar.example</a></li>
          </ul>
        </div>
      </div>
      <p className="container footer__legal">{t('footer.concept')}</p>
    </footer>
  )
}

export default function Layout() {
  const { t } = useSettings()
  const { pathname } = useLocation()
  const main = useRef(null)
  const first = useRef(true)

  // On route change: scroll to top and move focus to the page for keyboard and screen reader users.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a className="skip" href="#main">{t('skip')}</a>
      <Navbar />
      <main id="main" ref={main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
