import React, { useMemo, useState } from "react"
import { COMUNIDADES } from "../../constants/comunidades"
import { calcularITP, calcularIVA } from "../../utils/calculadora-hipotecaria"
import Input from "../calculadora-hipotecaria/Input"
import Select from "../calculadora-hipotecaria/Select"
import { formatNumberByLang } from "../../utils/number-format"

// Gastos de compraventa: impuestos (ITP autonómico o IVA+AJD en obra nueva)
// más los gastos regulados (notaría, registro) y habituales (gestoría,
// tasación si hay hipoteca). Aranceles aproximados por tramos de precio.
const AJD_ESTIMADO = 1.2 // % orientativo en obra nueva: cada CCAA fija 0,5–1,5 %

const LABELS = {
  es: {
    precio: "Precio de la vivienda (€)",
    comunidad: "Comunidad autónoma",
    tipoVivienda: "Tipo de vivienda",
    usada: "Segunda mano",
    nueva: "Obra nueva",
    conHipoteca: "Compra con hipoteca",
    impuestoITP: "ITP",
    impuestoIVA: "IVA (10 %)",
    ajd: `AJD (≈${AJD_ESTIMADO} %, según CCAA)`,
    notaria: "Notaría (escritura de compraventa)",
    registro: "Registro de la Propiedad",
    gestoria: "Gestoría",
    tasacion: "Tasación (la exige el banco)",
    total: "Total de gastos e impuestos",
    sobrePrecio: "sobre el precio",
    ahorro: "Ahorro total necesario (entrada 20 % + gastos)",
    nota: "Estimación orientativa: notaría y registro son aranceles regulados que dependen del importe y del número de folios; la gestoría es tarifa libre. Con hipoteca, el banco paga la notaría, registro, gestoría y AJD del préstamo (Ley 5/2019) — aquí solo se cuentan los gastos de la compraventa. El ITP mostrado es el tipo general de tu comunidad: si tienes derecho a bonificaciones (jóvenes, familia numerosa…), calcula el tuyo en la ",
    notaLink: "calculadora de ITP",
    itpHref: "/calculadora-itp",
  },
  en: {
    precio: "Property price (€)",
    comunidad: "Region",
    tipoVivienda: "Property type",
    usada: "Resale",
    nueva: "New build",
    conHipoteca: "Buying with a mortgage",
    impuestoITP: "ITP",
    impuestoIVA: "VAT (10%)",
    ajd: `AJD stamp duty (≈${AJD_ESTIMADO}%, varies by region)`,
    notaria: "Notary (purchase deed)",
    registro: "Land Registry",
    gestoria: "Gestoría (agency)",
    tasacion: "Appraisal (required by the bank)",
    total: "Total costs and taxes",
    sobrePrecio: "of the price",
    ahorro: "Total savings needed (20% down payment + costs)",
    nota: "Indicative estimate: notary and registry are regulated fees that depend on the amount and deed length; agency fees are unregulated. With a mortgage, the bank pays the loan's notary, registry, agency and AJD (Ley 5/2019) — only the purchase costs are counted here. The ITP shown is your region's general rate: if you qualify for reductions (young buyers, large families…), calculate yours with the ",
    notaLink: "ITP calculator",
    itpHref: "/en/itp-calculator",
  },
}

interface GastosCompraventaCalculatorProps {
  lang?: "es" | "en"
}

const GastosCompraventaCalculator: React.FC<GastosCompraventaCalculatorProps> = ({ lang = "es" }) => {
  const t = LABELS[lang]
  const [form, setForm] = useState({
    precio: "200000",
    comunidad: "",
    tipoVivienda: "Segunda mano",
    conHipoteca: true,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
      return
    }
    if (type === "number" && Number(value) < 0) return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const r = useMemo(() => {
    const precio = Number(form.precio) || 0
    const esNueva = form.tipoVivienda === "Obra nueva"
    const comunidad = COMUNIDADES.find((c) => c.nombre === form.comunidad)
    const porcentajeITP = comunidad?.ITP ?? 6

    const filas: { etiqueta: string; importe: number }[] = []
    if (precio > 0) {
      if (esNueva) {
        filas.push({ etiqueta: t.impuestoIVA, importe: calcularIVA(precio, 10) })
        filas.push({ etiqueta: t.ajd, importe: Math.round(precio * AJD_ESTIMADO) / 100 })
      } else {
        filas.push({
          etiqueta: `${t.impuestoITP} (${porcentajeITP}%${comunidad ? `, ${comunidad.nombre}` : ""})`,
          importe: calcularITP(precio, porcentajeITP),
        })
      }
      // Aranceles aproximados por tramos (notaría: RD 1426/1989; registro:
      // RD 1427/1989 — arancel de inscripción + IVA y conceptos menores)
      filas.push({ etiqueta: t.notaria, importe: Math.min(1200, Math.max(650, Math.round(600 + precio * 0.0009))) })
      filas.push({ etiqueta: t.registro, importe: Math.min(500, Math.max(250, Math.round(230 + precio * 0.0005))) })
      if (form.conHipoteca) {
        filas.push({ etiqueta: t.gestoria, importe: 350 })
        filas.push({ etiqueta: t.tasacion, importe: 400 })
      }
    }

    const total = filas.reduce((acc, f) => acc + f.importe, 0)
    const pct = precio > 0 ? (total / precio) * 100 : 0
    const ahorro = precio * 0.2 + total
    return { filas, total, pct, ahorro }
  }, [form, t])

  const fmt = (n: number) => formatNumberByLang(Math.round(n), lang)

  return (
    <div className='pl-card p-5 md:p-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4'>
        <Input label={t.precio} name='precio' value={form.precio} onChange={handleChange} type='number' min={0} showEuroSymbol={true} />
        <Select
          label={t.comunidad}
          name='comunidad'
          value={form.comunidad}
          onChange={handleChange}
          options={COMUNIDADES.map((c) => ({ value: c.nombre, label: c.nombre }))}
        />
        <Select
          label={t.tipoVivienda}
          name='tipoVivienda'
          value={form.tipoVivienda}
          onChange={handleChange}
          options={[
            { value: "Segunda mano", label: t.usada },
            { value: "Obra nueva", label: t.nueva },
          ]}
        />
      </div>
      <label className='flex items-center gap-2 text-sm text-ink mb-6 cursor-pointer'>
        <input type='checkbox' name='conHipoteca' checked={form.conHipoteca} onChange={handleChange} />
        {t.conHipoteca}
      </label>

      <div className='space-y-0'>
        {r.filas.map((f) => (
          <div key={f.etiqueta} className='flex justify-between py-2 border-b border-line text-sm'>
            <span className='text-ink-soft'>{f.etiqueta}</span>
            <b className='text-ink'>{fmt(f.importe)} €</b>
          </div>
        ))}
        {r.filas.length > 0 && (
          <>
            <div className='flex justify-between py-3 border-b border-line'>
              <span className='font-semibold text-ink'>{t.total}</span>
              <span className='font-heading text-2xl font-bold text-brand-blue'>
                {fmt(r.total)} € <span className='font-data text-xs text-ink-soft'>({r.pct.toFixed(1)}% {t.sobrePrecio})</span>
              </span>
            </div>
            <div className='flex justify-between py-3'>
              <span className='text-sm text-ink-soft'>{t.ahorro}</span>
              <b className='text-ink'>{fmt(r.ahorro)} €</b>
            </div>
          </>
        )}
      </div>

      <p className='text-xs text-ink-soft mt-4'>
        {t.nota}
        <a href={t.itpHref} className='underline text-brand-blue'>{t.notaLink}</a>.
      </p>
    </div>
  )
}

export default GastosCompraventaCalculator
