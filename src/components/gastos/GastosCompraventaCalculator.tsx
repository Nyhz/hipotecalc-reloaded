import React, { useMemo, useState } from "react"
import { COMUNIDADES } from "../../constants/comunidades"
import { calculatePurchaseTaxes, defaultPurchase } from "../../fiscal/engine"
import type { Purchase, TaxResult } from "../../fiscal/types"
import { REGIONS } from "../../fiscal/sources"
import ITPCalculator from "../calculadora-hipotecaria/ITPCalculator"
import TaxBreakdown from "../fiscal/TaxBreakdown"
import Input from "../calculadora-hipotecaria/Input"
import Select from "../calculadora-hipotecaria/Select"
import { formatNumberByLang } from "../../utils/number-format"
import { purchaseCosts } from "../../utils/purchase-costs"

// Gastos de compraventa: impuestos (ITP autonómico o IVA+AJD en obra nueva)
// más los gastos regulados (notaría, registro) y habituales (gestoría,
// tasación si hay hipoteca). Aranceles aproximados por tramos de precio.

const LABELS = {
  es: {
    precio: "Precio de la vivienda (€)",
    comunidad: "Comunidad autónoma",
    tipoVivienda: "Tipo de vivienda",
    usada: "Segunda mano",
    nueva: "Obra nueva",
    conHipoteca: "Compra con hipoteca",
    impuestoITP: "ITP",
    impuestoIVA: "IVA / IGIC / IPSI",
    notaria: "Notaría (escritura de compraventa)",
    registro: "Registro de la Propiedad",
    gestoria: "Gestoría",
    tasacion: "Tasación (la exige el banco)",
    total: "Total de gastos e impuestos",
    sobrePrecio: "sobre el precio",
    ahorro: "Ahorro total necesario (entrada 20 % + gastos)",
    ahorroContado: "Ahorro total necesario (precio completo + gastos)",
    nota: "Estimación orientativa: notaría y registro son aranceles regulados que dependen del importe y del número de folios; la gestoría es tarifa libre. Con hipoteca, el banco paga la notaría, registro, gestoría y AJD del préstamo (Ley 5/2019) — aquí solo se cuentan los gastos de la compraventa. El motor muestra las reglas verificadas y los datos pendientes. Puedes comprobar tus circunstancias en este formulario o en la ",
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
    impuestoIVA: "IVA / IGIC / IPSI",
    notaria: "Notary (purchase deed)",
    registro: "Land Registry",
    gestoria: "Gestoría (agency)",
    tasacion: "Appraisal (required by the bank)",
    total: "Total costs and taxes",
    sobrePrecio: "of the price",
    ahorro: "Total savings needed (20% down payment + costs)",
    ahorroContado: "Total savings needed (full price + costs)",
    nota: "Indicative estimate: notary and registry are regulated fees that depend on the amount and deed length; agency fees are unregulated. With a mortgage, the bank pays the loan's notary, registry, agency and AJD (Ley 5/2019) — only the purchase costs are counted here. The engine shows verified rules and outstanding data. Check your circumstances here or in the ",
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

  const [fiscalInput,setFiscalInput]=useState<Purchase|null>(null)
  const [showTax,setShowTax]=useState(false)
  const fiscal=useMemo(()=>calculatePurchaseTaxes({
    ...(fiscalInput??defaultPurchase(Number(form.precio),form.comunidad,form.tipoVivienda==='Obra nueva'?'Obra nueva':'Segunda mano')),
    precio:Number(form.precio),comunidad:form.comunidad,tipoVivienda:form.tipoVivienda==='Obra nueva'?'Obra nueva':'Segunda mano',
  }),[form.precio,form.comunidad,form.tipoVivienda,fiscalInput])
  const onTaxResult=(_n:number,_rate?:number,_description?:string,detail?:TaxResult)=>{
    if(!detail)return
    setFiscalInput(detail.input)
    setForm(p=>({...p,precio:String(detail.input.precio),comunidad:REGIONS.find(([id])=>id===detail.input.comunidad)?.[1]??detail.input.comunidad,tipoVivienda:detail.input.tipoVivienda}))
  }
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if(["comunidad","tipoVivienda"].includes(name))setFiscalInput(null)
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
      return
    }
    if (type === "number" && Number(value) < 0) return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const r = useMemo(() => {
    const precio = Number(form.precio) || 0
    const costs = purchaseCosts(precio, fiscal.total ?? 0, form.conHipoteca)
    const filas: { etiqueta: string; importe: number }[] = []
    if (precio > 0) {
      for(const line of fiscal.lines)if(line.amount!==null)filas.push({etiqueta:line.tax==='AJD'?t.comunidad+' · AJD':line.tax,importe:line.amount})
      // Aranceles aproximados por tramos (notaría: RD 1426/1989; registro:
      // RD 1427/1989 — arancel de inscripción + IVA y conceptos menores)
      filas.push({ etiqueta: t.notaria, importe: costs.notary })
      filas.push({ etiqueta: t.registro, importe: costs.registry })
      if (form.conHipoteca) {
        filas.push({ etiqueta: t.gestoria, importe: costs.agency })
        filas.push({ etiqueta: t.tasacion, importe: costs.appraisal })
      }
    }

    const total = costs.total
    const pct = precio > 0 ? (total / precio) * 100 : 0
    const ahorro = costs.savings
    return { filas, total, pct, ahorro }
  }, [form, t, fiscal])

  const fmt = (n: number) => formatNumberByLang(n, lang)

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

      <button type='button' className='btn-outline px-4 py-2 mb-4' onClick={()=>setShowTax(true)}>{lang==='es'?'Fecha, base fiscal y beneficios':'Date, tax base and relief'}</button>
      <TaxBreakdown result={fiscal} lang={lang}/>
      <ITPCalculator open={showTax} onClose={()=>setShowTax(false)} onResult={onTaxResult} initialPrecio={form.precio} comunidadSeleccionada={form.comunidad} initialTipoVivienda={form.tipoVivienda} initialFiscal={fiscalInput?fiscal.input:undefined} lang={lang}/>
      <div className='space-y-0'>
        {r.filas.map((f) => (
          <div key={f.etiqueta} className='flex justify-between py-2 border-b border-line text-sm'>
            <span className='text-ink-soft'>{f.etiqueta}</span>
            <b className='text-ink'>{fmt(f.importe)} €</b>
          </div>
        ))}
        {r.filas.length > 0 && fiscal.total!==null && (
          <>
            <div className='flex justify-between py-3 border-b border-line'>
              <span className='font-semibold text-ink'>{t.total}</span>
              <span className='font-heading text-2xl font-bold text-brand-blue'>
                {fmt(r.total)} € <span className='font-data text-xs text-ink-soft'>({r.pct.toFixed(1)}% {t.sobrePrecio})</span>
              </span>
            </div>
            <div className='flex justify-between py-3'>
              <span className='text-sm text-ink-soft'>{form.conHipoteca ? t.ahorro : t.ahorroContado}</span>
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
