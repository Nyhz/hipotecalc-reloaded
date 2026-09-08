/** Purchase estimates shared by the cost breakdown and required-savings total. */
export function purchaseCosts(price: number, taxes: number, withMortgage: boolean) {
  const notary = price > 0 ? Math.min(1200, Math.max(650, Math.round(600 + price * 0.0009))) : 0
  const registry = price > 0 ? Math.min(500, Math.max(250, Math.round(230 + price * 0.0005))) : 0
  const agency = price > 0 && withMortgage ? 350 : 0
  const appraisal = price > 0 && withMortgage ? 400 : 0
  const total = taxes + notary + registry + agency + appraisal
  return { notary, registry, agency, appraisal, total, savings: price * (withMortgage ? 0.2 : 1) + total }
}
