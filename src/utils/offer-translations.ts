import english from '../constants/hipotecas-bancos.en.json'

// Translate source text without changing bank/product names or the source data.
// Tests require coverage when the offer dataset introduces new explanatory text.
export function offerText(value: string, lang: 'es' | 'en'): string {
  if (!value) return lang === 'en' ? 'Not published' : 'N/D'
  if (lang === 'es') return value
  return (english as Record<string, string>)[value] ?? value.replace(/(\d),(?=\d)/g, '$1.')
}
