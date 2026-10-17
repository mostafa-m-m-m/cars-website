// Optimized images are bundled by Vite; look them up by base name: img('camry-red').
const modules = import.meta.glob('../assets/*.webp', { eager: true, query: '?url', import: 'default' })

const byName = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url]),
)

export const img = (name) => byName[name]
