import { useState } from 'react'
import { LuCircleCheck, LuClock, LuMail, LuMapPin, LuPhone } from 'react-icons/lu'
import { useSettings } from '../context/SettingsContext'
import { useMeta } from '../hooks/useMeta'
import { validateContact } from '../lib/validate'
import { Field, PageHeader } from '../components/ui'

const EMPTY = { name: '', email: '', message: '' }

// Demo form: validates, then confirms. Nothing leaves the browser.
export default function Contact() {
  const { t } = useSettings()
  useMeta(t('meta.contact.title'), t('meta.contact.desc'))
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const found = validateContact(values)
    setErrors(found)
    const first = ['name', 'email', 'message'].find((k) => found[k])
    if (first) {
      document.getElementById(`contact-${first}`)?.focus()
      return
    }
    setSent(true)
  }

  return (
    <>
      <PageHeader title={t('nav.contact')}>{t('contact.intro')}</PageHeader>
      <section className="section container contact">
        <div>
          <h2>{t('contact.reach')}</h2>
          <ul className="contact__list">
            <li><LuMapPin aria-hidden="true" /> <span>{t('contact.address')}</span></li>
            <li><LuPhone aria-hidden="true" /> <a href="tel:+201000000000" dir="ltr">+20 100 000 0000</a></li>
            <li><LuMail aria-hidden="true" /> <a href="mailto:hello@masar.example">hello@masar.example</a></li>
            <li><LuClock aria-hidden="true" /> <span>{t('contact.hours')}</span></li>
          </ul>
        </div>
        <div className="contact__form">
          {sent ? (
            <div className="success" role="status">
              <LuCircleCheck aria-hidden="true" size={44} />
              <h2>{t('contact.sentTitle')}</h2>
              <p>{t('contact.sentBody', { name: values.name.trim() })}</p>
              <p className="muted small">{t('demo.note')}</p>
              <button type="button" className="btn btn--ghost" onClick={() => { setValues(EMPTY); setSent(false) }}>{t('contact.another')}</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="form">
              <h2>{t('contact.formTitle')}</h2>
              <Field id="contact-name" label={t('form.name')} error={errors.name}>
                {(a) => <input {...a} type="text" autoComplete="name" value={values.name} onChange={set('name')} />}
              </Field>
              <Field id="contact-email" label={t('form.email')} error={errors.email}>
                {(a) => <input {...a} type="email" autoComplete="email" inputMode="email" value={values.email} onChange={set('email')} />}
              </Field>
              <Field id="contact-message" label={t('form.message')} error={errors.message}>
                {(a) => <textarea {...a} rows="5" value={values.message} onChange={set('message')} />}
              </Field>
              <p className="muted small">{t('demo.note')}</p>
              <button type="submit" className="btn btn--lg">{t('form.send')}</button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
