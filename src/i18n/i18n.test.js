import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import en from './en'
import ar from './ar'
import { cars, TYPES } from '../data/cars'
import { extras, faqs, locations, posts, services, testimonials } from '../data/content'

const placeholders = (s) => (s.match(/\{\w+\}/g) || []).sort().join(',')

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return name === 'assets' ? [] : sourceFiles(full)
    return /\.jsx?$/.test(name) && !name.endsWith('.test.js') ? [full] : []
  })
}

describe('translations', () => {
  it('has the same keys in English and Arabic', () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort())
  })

  it('uses the same placeholders in both languages', () => {
    for (const key of Object.keys(en)) expect(placeholders(ar[key]), key).toBe(placeholders(en[key]))
  })

  it('has no empty strings and every Arabic string contains Arabic letters', () => {
    for (const [key, value] of Object.entries(ar)) {
      expect(value.trim(), key).not.toBe('')
      expect(/[؀-ۿ]/.test(value), key).toBe(true)
    }
  })

  it('defines every key that the source code asks for', () => {
    const root = path.resolve(__dirname, '..')
    const used = new Set()
    for (const file of sourceFiles(root)) {
      const text = readFileSync(file, 'utf8')
      for (const m of text.matchAll(/\bt\('([\w.]+)'/g)) used.add(m[1])
      for (const m of text.matchAll(/'((?:nav|error|meta)\.[\w.]+)'/g)) used.add(m[1])
    }
    // keys built from a variable: expand with the values the code can produce
    for (const k of TYPES) used.add(`type.${k}`)
    for (const k of ['petrol', 'electric']) used.add(`fuel.${k}`)
    for (const k of ['cash', 'card', 'transfer']) used.add(`payment.${k}`)
    for (const k of ['recommended', 'priceAsc', 'priceDesc', 'rating']) used.add(`sort.${k}`)
    for (const k of ['confirmed', 'cancelled']) used.add(`status.${k}`)
    for (const key of used) expect(en[key], key).toBeDefined()
    expect(used.size).toBeGreaterThan(100)
  })

  it('has no unused translation keys', () => {
    const root = path.resolve(__dirname, '..')
    const all = sourceFiles(root).map((f) => readFileSync(f, 'utf8')).join('\n')
    const dynamic = /^(type|fuel|payment|sort|status)\./
    const unused = Object.keys(en).filter((key) => !dynamic.test(key) && !all.includes(`'${key}'`))
    expect(unused).toEqual([])
  })
})

describe('bilingual content', () => {
  const ok = (v) => typeof v?.en === 'string' && v.en.trim() && /[؀-ۿ]/.test(v.ar ?? '')

  it('every content string exists in English and Arabic', () => {
    const bad = []
    const check = (label, v) => ok(v) || bad.push(label)
    for (const c of cars) {
      check(`${c.id}.description`, c.description)
      c.features.forEach((f, i) => check(`${c.id}.feature.${i}`, f))
      c.colors.forEach((col) => check(`${c.id}.color.${col.id}`, col.label))
    }
    for (const l of locations) check(`loc.${l.id}`, l.name)
    for (const e of extras) check(`extra.${e.id}`, e.name)
    for (const s of services) ['title', 'text'].forEach((k) => check(`service.${s.id}.${k}`, s[k]))
    for (const t of testimonials) for (const k of ['name', 'role', 'quote']) check(`${t.id}.${k}`, t[k])
    for (const f of faqs) ['q', 'a'].forEach((k) => check(`${f.id}.${k}`, f[k]))
    for (const p of posts) {
      for (const k of ['title', 'excerpt']) check(`${p.id}.${k}`, p[k])
      p.body.forEach((para, i) => check(`${p.id}.body.${i}`, para))
    }
    expect(bad).toEqual([])
  })

  it('every car type used by the catalog has a label', () => {
    for (const c of cars) {
      expect(en[`type.${c.type}`], c.type).toBeDefined()
      expect(ar[`type.${c.type}`], c.type).toBeDefined()
    }
  })
})
