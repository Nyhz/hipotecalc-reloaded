import type { OfertaHipoteca } from '../constants/hipotecas-bancos'

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const englishTypes: Record<string, string> = { Fija: 'fixed', Variable: 'variable', Mixta: 'mixed' }

export function filterMortgageOffers(
  offers: OfertaHipoteca[],
  { query = '', type = 'Todas', category = 'Todas' } = {},
): OfertaHipoteca[] {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean)
  return offers.filter(offer => {
    const types = offer.tipo.split('/')
    if (type !== 'Todas' && !types.includes(type)) return false
    if (category !== 'Todas' && offer.categoria !== category) return false
    const searchable = normalizeSearch(`${offer.banco} ${offer.producto} ${offer.tipo} ${types.map(t => englishTypes[t]).join(' ')}`)
    return words.every(word => searchable.includes(word))
  })
}
