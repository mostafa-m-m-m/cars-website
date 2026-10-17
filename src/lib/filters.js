// Catalog search, filters and sorting. Pure and unit tested.
export const SORTS = ['recommended', 'priceAsc', 'priceDesc', 'rating']

export function filterCars(cars, { q = '', type = 'all', seats = 0, maxPrice = Infinity, fuel = 'all' } = {}) {
  const needle = q.trim().toLowerCase()
  return cars.filter(
    (c) =>
      (!needle || `${c.brand} ${c.name} ${c.type}`.toLowerCase().includes(needle)) &&
      (type === 'all' || c.type === type) &&
      (fuel === 'all' || c.fuel === fuel) &&
      c.seats >= seats &&
      c.priceEgp <= maxPrice,
  )
}

export function sortCars(cars, sort = 'recommended') {
  const list = [...cars]
  switch (sort) {
    case 'priceAsc':
      return list.sort((a, b) => a.priceEgp - b.priceEgp || b.rating - a.rating)
    case 'priceDesc':
      return list.sort((a, b) => b.priceEgp - a.priceEgp || b.rating - a.rating)
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    default:
      return list
  }
}

// Reads filter values from URLSearchParams with safe defaults (the URL is user input).
export function readFilters(params, priceMax) {
  const num = (key, fallback, min, max) => {
    const n = Number(params.get(key))
    return params.get(key) && Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback
  }
  return {
    q: params.get('q') ?? '',
    type: params.get('type') ?? 'all',
    fuel: params.get('fuel') ?? 'all',
    seats: num('seats', 0, 0, 9),
    maxPrice: num('max', priceMax, 0, priceMax),
    sort: SORTS.includes(params.get('sort')) ? params.get('sort') : 'recommended',
  }
}
