import React, { useMemo, useState } from "react"
import Input from "../calculadora-hipotecaria/Input"
import { formatNumberByLang } from "../../utils/number-format"

// Plusvalía municipal (IIVTNU) tras el RDL 26/2021: el contribuyente puede
// elegir entre la base objetiva (valor catastral del suelo × coeficiente por
// años de tenencia) y la real (ganancia × proporción del suelo). Se paga la
// menor; si hay pérdida, la operación está exenta.
// Coeficientes: máximos estatales vigentes desde el 1-1-2024 (art. 24 del
// RDL 8/2023), prorrogados en 2025 y 2026 al no convalidarse los RDL 9/2024
// y 16/2025 que los sustituían. Los ayuntamientos pueden aplicar otros menores.
const COEFICIENTES = [
  0.15, 0.15, 0.14, 0.14, 0.16, 0.18, 0.19, 0.2, 0.19, 0.15, 0.12,
  0.1, 0.09, 0.09, 0.09, 0.09, 0.1, 0.13, 0.17, 0.23, 0.4,
]

const LABELS = {
  es: {
    precioCompra: "Precio de compra (€)",
    precioVenta: "Precio de venta (€)",
    anosTenencia: "Años entre compra y venta",
    vcSuelo: "Valor catastral del suelo (€)",
    vcTotal: "Valor catastral total (€)",
    tipo: "Tipo impositivo municipal (%)",
    exenta: "Operación exenta de plusvalía",
    exentaNota:
      "Has vendido sin ganancia (o con pérdida): desde la sentencia del Constitucional y el RDL 26/2021, no se paga plusvalía municipal. Deberás acreditarlo ante el ayuntamiento con las escrituras.",
    resultado: "Plusvalía municipal estimada",
    metodoObjetivo: "Método objetivo",
    metodoReal: "Método real (plusvalía efectiva)",
    base: "Base imponible",
    cuota: "Cuota",
    eligeMenor: "Por ley pagas la menor de las dos",
    nota: "Estimación con los coeficientes máximos estatales vigentes (RDL 8/2023, prorrogados para 2026) y el tipo que indiques (máximo legal: 30 %). Cada ayuntamiento fija sus propios coeficientes (≤ a los estatales), su tipo y posibles bonificaciones: confirma el cálculo en tu sede municipal. El valor catastral (suelo y total) figura en el recibo del IBI.",
  },
  en: {
    precioCompra: "Purchase price (€)",
    precioVenta: "Sale price (€)",
    anosTenencia: "Years between purchase and sale",
    vcSuelo: "Cadastral land value (€)",
    vcTotal: "Total cadastral value (€)",
    tipo: "Municipal tax rate (%)",
    exenta: "Exempt from plusvalía",
    exentaNota:
      "You sold with no gain (or at a loss): since the Constitutional Court ruling and RDL 26/2021, no municipal plusvalía is due. You must evidence it to the town hall with both deeds.",
    resultado: "Estimated municipal plusvalía",
    metodoObjetivo: "Objective method",
    metodoReal: "Real method (actual gain)",
    base: "Taxable base",
    cuota: "Tax due",
    eligeMenor: "By law you pay the lower of the two",
    nota: "Estimate using the state maximum coefficients in force (RDL 8/2023, extended into 2026) and the rate you enter (legal maximum: 30%). Each town hall sets its own coefficients (≤ the state ones), its rate and possible reliefs: confirm the figure with your municipality. The cadastral values (land and total) appear on the IBI bill.",
  },
}

interface PlusvaliaCalculatorProps {
  lang?: "es" | "en"
}

const PlusvaliaCalculator: React.FC<PlusvaliaCalculatorProps> = ({ lang = "es" }) => {
  const t = LABELS[lang]
  const [form, setForm] = useState({
    precioCompra: "150000",
    precioVenta: "200000",
    anos: "10",
    vcSuelo: "30000",
    vcTotal: "80000",
    tipo: "30",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (Number(value) < 0) return
    if (name === "tipo" && Number(value) > 30) return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const r = useMemo(() => {
    const compra = Number(form.precioCompra) || 0
    const venta = Number(form.precioVenta) || 0
    const anos = Math.min(Math.max(Math.floor(Number(form.anos) || 0), 0), 20)
    const vcSuelo = Number(form.vcSuelo) || 0
    const vcTotal = Number(form.vcTotal) || 0
    const tipo = (Number(form.tipo) || 0) / 100

    const ganancia = venta - compra
    if (venta > 0 && compra > 0 && ganancia <= 0) {
      return { exenta: true }
    }

    const baseObjetiva = vcSuelo * COEFICIENTES[anos]
    const cuotaObjetiva = Math.round(baseObjetiva * tipo * 100) / 100

    const proporcionSuelo = vcTotal > 0 ? vcSuelo / vcTotal : 0
    const baseReal = Math.max(0, ganancia) * proporcionSuelo
    const cuotaReal = Math.round(baseReal * tipo * 100) / 100

    const mejor = cuotaReal <= cuotaObjetiva ? "real" : "objetivo"
    return { exenta: false, baseObjetiva, cuotaObjetiva, baseReal, cuotaReal, mejor, coef: COEFICIENTES[anos] }
  }, [form])

  const fmt = (n: number) => formatNumberByLang(Math.round(n * 100) / 100, lang)

  return (
    <div className='pl-card p-5 md:p-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        <Input label={t.precioCompra} name='precioCompra' value={form.precioCompra} onChange={handleChange} type='number' min={0} showEuroSymbol={true} />
        <Input label={t.precioVenta} name='precioVenta' value={form.precioVenta} onChange={handleChange} type='number' min={0} showEuroSymbol={true} />
        <Input label={t.anosTenencia} name='anos' value={form.anos} onChange={handleChange} type='number' min={0} max={20} />
        <Input label={t.vcSuelo} name='vcSuelo' value={form.vcSuelo} onChange={handleChange} type='number' min={0} showEuroSymbol={true} />
        <Input label={t.vcTotal} name='vcTotal' value={form.vcTotal} onChange={handleChange} type='number' min={0} showEuroSymbol={true} />
        <Input label={t.tipo} name='tipo' value={form.tipo} onChange={handleChange} type='number' min={0} max={30} step={0.01} />
      </div>

      {r.exenta ? (
        <div className='pl-card p-5 border-l-4 border-lime'>
          <div className='font-heading text-2xl font-bold text-positive mb-1' style={{ color: "var(--color-positive)" }}>
            {t.exenta}: 0 €
          </div>
          <p className='text-sm text-ink-soft'>{t.exentaNota}</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {[
            { id: "objetivo", titulo: t.metodoObjetivo, base: r.baseObjetiva ?? 0, cuota: r.cuotaObjetiva ?? 0 },
            { id: "real", titulo: t.metodoReal, base: r.baseReal ?? 0, cuota: r.cuotaReal ?? 0 },
          ].map((m) => (
            <div key={m.id} className={`pl-card p-4 ${r.mejor === m.id ? "border-l-4 border-lime" : "opacity-80"}`}>
              <span className='font-data text-[10.5px] uppercase tracking-widest text-ink-soft'>{m.titulo}</span>
              <div className='font-heading text-3xl font-bold mt-1' style={{ color: r.mejor === m.id ? "var(--color-brand-blue)" : "var(--color-ink)" }}>
                {fmt(m.cuota)} €
              </div>
              <p className='text-xs text-ink-soft mt-1'>
                {t.base}: {fmt(m.base)} €
              </p>
              {r.mejor === m.id && (
                <p className='font-data text-[11px] mt-2' style={{ color: "var(--color-positive)" }}>
                  ✓ {t.eligeMenor}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className='text-xs text-ink-soft mt-4'>{t.nota}</p>
    </div>
  )
}

export default PlusvaliaCalculator
