import test from 'node:test'
import assert from 'node:assert/strict'
import { calculatePurchaseTaxes, defaultPurchase } from '../src/fiscal/engine'
import { purchaseCosts } from '../src/utils/purchase-costs'
import { calculatePlusvalia, type PlusvaliaInput } from '../src/utils/plusvalia'
import { isValidLoanTerm, cuotaFrancesa } from '../src/utils/calculadora-hipotecaria'
import { OFERTAS_HIPOTECAS, ENTIDADES_SIN_OFERTA } from '../src/constants/hipotecas-bancos'
import translations from '../src/constants/hipotecas-bancos.en.json'
import { offerText } from '../src/utils/offer-translations'

test('Madrid purchase: cash covers the full price; financing covers only the down payment', () => {
  const tax = calculatePurchaseTaxes({ ...defaultPurchase(200000, 'madrid'), referenciaExiste: false, habitual: false }).total
  assert.equal(tax, 12000)
  const cash = purchaseCosts(200000, tax!, false)
  const financed = purchaseCosts(200000, tax!, true)
  assert.equal(cash.savings, 213110)
  assert.equal(cash.total, 13110)
  assert.equal(cash.appraisal, 0)
  assert.equal(financed.savings, 53860)
  assert.equal(financed.appraisal, 400)
  assert.equal(purchaseCosts(0, 0, false).savings, 0)
})

test('higher tax reference value affects taxes, not the cash-purchase principal', () => {
  const tax = calculatePurchaseTaxes({ ...defaultPurchase(200000, 'madrid'), referenciaExiste: true, valorReferencia: 250000, habitual: false }).total
  assert.equal(tax, 15000)
  assert.equal(purchaseCosts(200000, tax!, false).savings, 216110)
})

const sale: PlusvaliaInput = { precioCompra: '150000', precioVenta: '200000', anos: '10', meses: '', vcSuelo: '30000', vcTotal: '80000', tipo: '30' }
function taxable(extra: Partial<PlusvaliaInput> = {}) {
  const result = calculatePlusvalia({ ...sale, ...extra })
  assert.equal(result.valid, true)
  if (!result.valid || result.exenta) throw new Error('Expected a taxable, valid transaction')
  return result
}
test('plusvalia preserves whole-year, real-method and long-ownership results', () => {
  const standard = taxable()
  assert.equal(standard.cuotaObjetiva, 1080)
  assert.equal(standard.cuotaReal, 5625)
  assert.equal(standard.mejor, 'objetivo')
  const lowGain = taxable({ precioCompra: '200000', precioVenta: '206000', anos: '7', vcSuelo: '40000', vcTotal: '100000' })
  assert.equal(lowGain.cuotaReal, 720)
  assert.equal(lowGain.mejor, 'real')
  assert.equal(taxable({ anos: '35' }).cuotaObjetiva, 3600)
})
test('plusvalia counts completed months below one year and switches at one year', () => {
  assert.equal(taxable({ anos: '0', meses: '0' }).cuotaObjetiva, 0)
  assert.equal(taxable({ anos: '0', meses: '1' }).cuotaObjetiva, 112.5)
  assert.equal(taxable({ anos: '0', meses: '6' }).cuotaObjetiva, 675)
  assert.equal(taxable({ anos: '0', meses: '11' }).cuotaObjetiva, 1237.5)
  assert.equal(taxable({ anos: '1', meses: '11' }).cuotaObjetiva, 1350)
})
test('plusvalia rejects missing or inconsistent inputs instead of recommending zero', () => {
  for (const extra of [
    { vcTotal: '0' }, { vcTotal: '' }, { vcTotal: '29999' }, { vcSuelo: '0' },
    { anos: '0.5' }, { anos: '' }, { anos: '0', meses: '' }, { anos: '0', meses: '12' },
    { anos: '0', meses: '1.5' }, { tipo: '' }, { tipo: '31' }, { precioCompra: '' }, { precioVenta: 'Infinity' },
  ]) assert.equal(calculatePlusvalia({ ...sale, ...extra }).valid, false, JSON.stringify(extra))
})
test('losses and unchanged prices remain exempt; a zero municipal rate is valid', () => {
  for (const precioVenta of ['140000', '150000']) assert.deepEqual(calculatePlusvalia({ ...sale, precioVenta }), { valid: true, exenta: true })
  assert.equal(taxable({ tipo: '0' }).cuotaObjetiva, 0)
})
test('loan terms reject empty, zero, fractional and out-of-range years without rejecting zero interest', () => {
  for (const value of ['', ' ', '0', '-1', '0.5', '30.5', '41', 'Infinity']) assert.equal(isValidLoanTerm(value), false, value)
  for (const value of ['1', '30', '40']) assert.equal(isValidLoanTerm(value), true, value)
  assert.equal(cuotaFrancesa(240000, 0, 30), 240000 / 360)
  assert.equal(cuotaFrancesa(160000, 3, 30), 674.57)
})
test('all explanatory offer fields have explicit English translations', () => {
  const fields = ['tin', 'tae', 'tinAnterior', 'taeAnterior', 'plazoMax', 'financiacionMax', 'diferencial', 'vinculaciones', 'comisiones', 'requisitos'] as const
  const texts = [...OFERTAS_HIPOTECAS.flatMap(o => fields.map(field => o[field] ?? '')), ...ENTIDADES_SIN_OFERTA.map(e => e.nota)]
  for (const value of texts) {
    if (/[a-záéíóúñ]/i.test(value)) assert.ok(Object.hasOwn(translations, value), `Missing English translation: ${value}`)
  }
  assert.equal(offerText('Nómina, seguro de vida, seguro de hogar', 'en'), 'Salary payments, life insurance, home insurance')
  assert.equal(offerText('30 años', 'en'), '30 years')
  assert.equal(offerText('2,85%', 'en'), '2.85%')
  assert.equal(offerText('', 'en'), 'Not published')
  assert.equal(offerText('30 años', 'es'), '30 años')
})
