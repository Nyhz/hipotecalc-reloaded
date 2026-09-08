// Article 107.4 TRLRHL: state maximum coefficients; under one year is prorated
// by completed months. Municipalities may approve lower coefficients.
const COEFFICIENTS = [0.15, 0.15, 0.14, 0.14, 0.16, 0.18, 0.19, 0.2, 0.19, 0.15, 0.12,
  0.1, 0.09, 0.09, 0.09, 0.09, 0.1, 0.13, 0.17, 0.23, 0.4]

export interface PlusvaliaInput {
  precioCompra: string
  precioVenta: string
  anos: string
  meses: string
  vcSuelo: string
  vcTotal: string
  tipo: string
}
export type PlusvaliaError = 'prices' | 'years' | 'months' | 'cadastral' | 'rate'
const number = (value: string) => value.trim() === '' ? NaN : Number(value)

export function calculatePlusvalia(input: PlusvaliaInput) {
  const compra = number(input.precioCompra), venta = number(input.precioVenta)
  const anos = number(input.anos), meses = number(input.meses)
  const vcSuelo = number(input.vcSuelo), vcTotal = number(input.vcTotal), tipo = number(input.tipo)
  const invalid = (error: PlusvaliaError) => ({ valid: false as const, error })
  if (![compra, venta].every(n => Number.isFinite(n) && n > 0)) return invalid('prices')
  if (!Number.isSafeInteger(anos) || anos < 0) return invalid('years')
  if (anos === 0 && (!Number.isInteger(meses) || meses < 0 || meses > 11)) return invalid('months')
  if (venta <= compra) return { valid: true as const, exenta: true as const }
  if (![vcSuelo, vcTotal].every(n => Number.isFinite(n) && n > 0) || vcSuelo > vcTotal) return invalid('cadastral')
  if (!Number.isFinite(tipo) || tipo < 0 || tipo > 30) return invalid('rate')
  const coef = COEFFICIENTS[Math.min(anos, 20)] * (anos === 0 ? meses / 12 : 1)
  const baseObjetiva = vcSuelo * coef
  const baseReal = (venta - compra) * vcSuelo / vcTotal
  const cuotaObjetiva = Math.round(baseObjetiva * tipo) / 100
  const cuotaReal = Math.round(baseReal * tipo) / 100
  return { valid: true as const, exenta: false as const, baseObjetiva, baseReal, cuotaObjetiva, cuotaReal,
    mejor: cuotaReal <= cuotaObjetiva ? 'real' : 'objetivo', coef }
}
