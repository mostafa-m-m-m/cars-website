import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from '../i18n/en'
import ar from '../i18n/ar'

const dictionaries = { en, ar }
const SettingsContext = createContext(null)

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable: keep working with in-memory state
  }
}

export function SettingsProvider({ children }) {
  const [lang, setLang] = useState(() => load('masar.lang', navigator.language?.startsWith('ar') ? 'ar' : 'en'))
  const [theme, setTheme] = useState(() => load('masar.theme', 'light')) // light | dark

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
    root.dataset.theme = theme
    save('masar.lang', lang)
    save('masar.theme', theme)
  }, [lang, theme])

  const t = useCallback(
    (key, vars) => {
      const text = dictionaries[lang][key] ?? dictionaries.en[key] ?? key
      return vars ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '') : text
    },
    [lang],
  )

  // Pick the current language from a bilingual { en, ar } value.
  const tr = useCallback((value) => (value ? value[lang] ?? value.en : ''), [lang])

  const value = useMemo(() => {
    const locale = lang === 'ar' ? 'ar-EG' : 'en-GB'
    const number = new Intl.NumberFormat(locale)
    const date = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    const longDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12: true })
    return {
      lang,
      setLang,
      theme,
      setTheme,
      t,
      tr,
      formatNumber: (n) => number.format(n),
      formatMoney: (n) => `${number.format(n)} ${lang === 'ar' ? 'ج.م' : 'EGP'}`,
      formatDate: (d) => date.format(d),
      formatLongDate: (d) => longDate.format(d),
      formatTime: (d) => time.format(d),
      formatRating: (n) => new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n),
    }
  }, [lang, theme, t, tr])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
