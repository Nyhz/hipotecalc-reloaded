import React, { useMemo, useState } from "react"
import Input from "../calculadora-hipotecaria/Input"
import { formatNumberByLang } from "../../utils/number-format"
import { calculatePlusvalia } from "../../utils/plusvalia"

// Plusvalía municipal (IIVTNU) tras el RDL 26/2021: el contribuyente puede
// elegir entre la base objetiva (valor catastral del suelo × coeficiente por
// años de tenencia) y la real (ganancia × proporción del suelo). Se paga la
// menor; si hay pérdida, la operación está exenta.
// Coeficientes: máximos estatales vigentes desde el 1-1-2024 (art. 24 del
// RDL 8/2023), prorrogados en 2025 y 2026 al no convalidarse los RDL 9/2024
// y 16/2025 que los sustituían. Los ayuntamientos pueden aplicar otros menores.

const LABELS = {
  es: {
    precioCompra: "Precio de compra (€)",
    precioVenta: "Precio de venta (€)",
    anosTenencia: "Años completos entre compra y venta",
    meses: "Meses completos (si han pasado menos de 12 meses)",
    mesesNota: "Introduce 0 años para una venta en menos de un año. Solo cuentan los meses completos; menos de un mes son 0 meses.",
    errors: {
      prices: "Introduce precios de compra y venta positivos.",
      years: "Introduce los años completos como un número entero de 0 o más.",
      months: "Introduce los meses completos entre 0 y 11 para una venta en menos de un año.",
      cadastral: "Introduce valores catastrales positivos. El total debe ser igual o superior al valor del suelo.",
      rate: "Introduce un tipo municipal entre 0 y 30 %.",
    },
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
    anosTenencia: "Completed years between purchase and sale",
    meses: "Completed months (when less than 12 months have elapsed)",
    mesesNota: "Enter 0 years for a sale within one year. Only completed months count; less than one month is 0 months.",
    errors: {
      prices: "Enter positive purchase and sale prices.",
      years: "Enter completed years as a whole number of 0 or more.",
      months: "Enter completed months from 0 to 11 for a sale within one year.",
      cadastral: "Enter positive cadastral values. The total must be at least the land value.",
      rate: "Enter a municipal rate between 0 and 30%.",
    },
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
    meses: "",
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

  const r = useMemo(() => calculatePlusvalia(form), [form])

  const fmt = (n: number) => formatNumberByLang(Math.round(n * 100) / 100, lang)

  return (
    <div className='pl-card p-5 md:p-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        <Input label={t.precioCompra} name='precioCompra' value={form.precioCompra} onChange={handleChange} type='number' min={0} showEuroSymbol={true} />
        <Input label={t.precioVenta} name='precioVenta' value={form.precioVenta} onChange={handleChange} type='number' min={0} showEuroSymbol={true} />
        <div>
          <Input label={t.anosTenencia} name='anos' value={form.anos} onChange={handleChange} type='number' min={0} step={1} />
          <p className='text-xs text-ink-soft mt-2'>{t.mesesNota}</p>
        </div>
        {form.anos.trim() !== '' && Number(form.anos) === 0 && <Input label={t.meses} name='meses' value={form.meses} onChange={handleChange} type='number' min={0} max={11} step={1} />}
        <Input label={t.vcSuelo} name='vcSuelo' value={form.vcSuelo} onChange={handleChange} type='number' min={0} showEuroSymbol={true} />
        <Input label={t.vcTotal} name='vcTotal' value={form.vcTotal} onChange={handleChange} type='number' min={0} showEuroSymbol={true} />
        <Input label={t.tipo} name='tipo' value={form.tipo} onChange={handleChange} type='number' min={0} max={30} step={0.01} />
      </div>

      {!r.valid ? <p role='status' className='text-sm text-negative'>{t.errors[r.error]}</p> : r.exenta ? (
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
