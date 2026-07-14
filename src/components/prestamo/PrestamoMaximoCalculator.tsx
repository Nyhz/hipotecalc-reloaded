import React, { useMemo, useState } from "react"
import { capitalDesdeCuota, cuotaFrancesa } from "../../utils/calculadora-hipotecaria"
import Input from "../calculadora-hipotecaria/Input"
import { formatNumberByLang } from "../../utils/number-format"

// Landing /cuanto-me-prestan: regla del 35 % de endeudamiento. La cuota máxima
// asumible es el 35 % de los ingresos netos menos otras deudas; de ahí se
// deriva el capital máximo por el sistema francés.
const RATIO_ENDEUDAMIENTO = 0.35
const FINANCIACION_MAXIMA = 0.8 // los bancos financian hasta el 80 % del precio

const LABELS = {
  es: {
    ingresos: 'Ingresos netos del hogar (€/mes)',
    deudas: 'Otras cuotas de préstamos (€/mes)',
    interes: 'Interés estimado (%)',
    plazo: 'Plazo (años)',
    prestaria: 'El banco te prestaría hasta',
    cuotaNota1: 'con una cuota máxima de ',
    cuotaNota2: ' €/mes (35 % de tus ingresos menos otras deudas)',
    precio: 'Precio de vivienda alcanzable',
    precioNota: 'asumiendo que el banco financia como máximo el 80 % del precio',
    ahorro: 'Ahorro que necesitarías',
    ahorroNota: 'el 20 % de entrada más un ~12 % de impuestos y gastos de compraventa',
    nota1: 'Estimación orientativa según la regla de endeudamiento del 35 % que recomienda el Banco de España. Cada entidad aplica sus propios criterios (estabilidad de ingresos, edad, tasación). Simula la operación completa en la ',
    notaCalc: 'calculadora de hipoteca',
    nota2: ' y revisa las ',
    notaComp: 'ofertas de cada banco',
    calcHref: '/calculadora-hipotecaria',
    compHref: '/comparativa-hipotecas',
  },
  en: {
    ingresos: 'Net household income (€/month)',
    deudas: 'Other loan payments (€/month)',
    interes: 'Estimated rate (%)',
    plazo: 'Term (years)',
    prestaria: 'A bank would lend you up to',
    cuotaNota1: 'with a maximum payment of ',
    cuotaNota2: ' €/month (35% of your income minus other debts)',
    precio: 'Reachable property price',
    precioNota: 'assuming the bank finances at most 80% of the price',
    ahorro: 'Savings you would need',
    ahorroNota: 'the 20% down payment plus ~12% in taxes and purchase costs',
    nota1: 'Indicative estimate using the 35% debt-to-income rule recommended by the Bank of Spain. Each lender applies its own criteria (income stability, age, appraisal). Simulate the full operation in the ',
    notaCalc: 'mortgage calculator',
    nota2: ' and review ',
    notaComp: 'each bank\'s offers',
    calcHref: '/en/mortgage-calculator',
    compHref: '/en/mortgage-comparison',
  },
}

interface PrestamoMaximoCalculatorProps {
  lang?: 'es' | 'en'
}

const PrestamoMaximoCalculator: React.FC<PrestamoMaximoCalculatorProps> = ({ lang = 'es' }) => {
  const t = LABELS[lang]
  const [form, setForm] = useState({
    ingresos: "3000",
    deudas: "0",
    interes: "2.9",
    plazo: "30",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (Number(value) < 0) return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const resultado = useMemo(() => {
    const ingresos = Number(form.ingresos) || 0
    const deudas = Number(form.deudas) || 0
    const interes = Number(form.interes) || 0
    const plazo = Number(form.plazo) || 0

    const cuotaMaxima = Math.max(0, ingresos * RATIO_ENDEUDAMIENTO - deudas)
    const capitalMaximo = capitalDesdeCuota(cuotaMaxima, interes, plazo)
    const precioVivienda = capitalMaximo > 0 ? capitalMaximo / FINANCIACION_MAXIMA : 0
    // Entrada 20 % + ~12 % de impuestos y gastos sobre el precio
    const ahorroNecesario = precioVivienda * (0.2 + 0.12)
    const ratioReal = ingresos > 0 ? ((cuotaFrancesa(capitalMaximo, interes, plazo) + deudas) / ingresos) * 100 : 0

    return { cuotaMaxima, capitalMaximo, precioVivienda, ahorroNecesario, ratioReal }
  }, [form])

  const fmt = (n: number) => formatNumberByLang(Math.round(n), lang)

  return (
    <div className='pl-card p-5 md:p-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Input
          label={t.ingresos}
          name='ingresos'
          value={form.ingresos}
          onChange={handleChange}
          type='number'
          min={0}
          showEuroSymbol={true}
        />
        <Input
          label={t.deudas}
          name='deudas'
          value={form.deudas}
          onChange={handleChange}
          type='number'
          min={0}
          showEuroSymbol={true}
        />
        <Input
          label={t.interes}
          name='interes'
          value={form.interes}
          onChange={handleChange}
          type='number'
          min={0}
          step={0.01}
        />
        <Input
          label={t.plazo}
          name='plazo'
          value={form.plazo}
          onChange={handleChange}
          type='number'
          min={1}
          max={40}
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='pl-card p-4 border-l-4 border-lime sm:col-span-1'>
          <span className='font-data text-[10.5px] uppercase tracking-widest text-ink-soft'>
            {t.prestaria}
          </span>
          <div className='font-heading text-3xl font-bold text-brand-blue mt-1'>
            {fmt(resultado.capitalMaximo)} €
          </div>
          <p className='text-xs text-ink-soft mt-1'>
            {t.cuotaNota1}{fmt(resultado.cuotaMaxima)}{t.cuotaNota2}
          </p>
        </div>
        <div className='pl-card p-4'>
          <span className='font-data text-[10.5px] uppercase tracking-widest text-ink-soft'>
            {t.precio}
          </span>
          <div className='font-heading text-3xl font-bold text-ink mt-1'>
            {fmt(resultado.precioVivienda)} €
          </div>
          <p className='text-xs text-ink-soft mt-1'>
            {t.precioNota}
          </p>
        </div>
        <div className='pl-card p-4'>
          <span className='font-data text-[10.5px] uppercase tracking-widest text-ink-soft'>
            {t.ahorro}
          </span>
          <div className='font-heading text-3xl font-bold text-ink mt-1'>
            {fmt(resultado.ahorroNecesario)} €
          </div>
          <p className='text-xs text-ink-soft mt-1'>
            {t.ahorroNota}
          </p>
        </div>
      </div>

      <p className='text-xs text-ink-soft mt-4'>
        {t.nota1}
        <a href={t.calcHref} className='underline text-brand-blue'>
          {t.notaCalc}
        </a>
        {t.nota2}
        <a href={t.compHref} className='underline text-brand-blue'>
          {t.notaComp}
        </a>
        .
      </p>
    </div>
  )
}

export default PrestamoMaximoCalculator
