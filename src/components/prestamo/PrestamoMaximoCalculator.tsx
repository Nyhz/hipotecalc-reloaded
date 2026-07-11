import React, { useMemo, useState } from "react"
import { capitalDesdeCuota, cuotaFrancesa } from "../../utils/calculadora-hipotecaria"
import Input from "../calculadora-hipotecaria/Input"
import { formatNumberByLang } from "../../utils/number-format"

// Landing /cuanto-me-prestan: regla del 35 % de endeudamiento. La cuota máxima
// asumible es el 35 % de los ingresos netos menos otras deudas; de ahí se
// deriva el capital máximo por el sistema francés.
const RATIO_ENDEUDAMIENTO = 0.35
const FINANCIACION_MAXIMA = 0.8 // los bancos financian hasta el 80 % del precio

const PrestamoMaximoCalculator: React.FC = () => {
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

  const fmt = (n: number) => formatNumberByLang(Math.round(n), "es")

  return (
    <div className='pl-card p-5 md:p-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Input
          label='Ingresos netos del hogar (€/mes)'
          name='ingresos'
          value={form.ingresos}
          onChange={handleChange}
          type='number'
          min={0}
          showEuroSymbol={true}
        />
        <Input
          label='Otras cuotas de préstamos (€/mes)'
          name='deudas'
          value={form.deudas}
          onChange={handleChange}
          type='number'
          min={0}
          showEuroSymbol={true}
        />
        <Input
          label='Interés estimado (%)'
          name='interes'
          value={form.interes}
          onChange={handleChange}
          type='number'
          min={0}
          step={0.01}
        />
        <Input
          label='Plazo (años)'
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
            El banco te prestaría hasta
          </span>
          <div className='font-heading text-3xl font-bold text-brand-blue mt-1'>
            {fmt(resultado.capitalMaximo)} €
          </div>
          <p className='text-xs text-ink-soft mt-1'>
            con una cuota máxima de {fmt(resultado.cuotaMaxima)} €/mes (35 % de tus ingresos
            menos otras deudas)
          </p>
        </div>
        <div className='pl-card p-4'>
          <span className='font-data text-[10.5px] uppercase tracking-widest text-ink-soft'>
            Precio de vivienda alcanzable
          </span>
          <div className='font-heading text-3xl font-bold text-ink mt-1'>
            {fmt(resultado.precioVivienda)} €
          </div>
          <p className='text-xs text-ink-soft mt-1'>
            asumiendo que el banco financia como máximo el 80 % del precio
          </p>
        </div>
        <div className='pl-card p-4'>
          <span className='font-data text-[10.5px] uppercase tracking-widest text-ink-soft'>
            Ahorro que necesitarías
          </span>
          <div className='font-heading text-3xl font-bold text-ink mt-1'>
            {fmt(resultado.ahorroNecesario)} €
          </div>
          <p className='text-xs text-ink-soft mt-1'>
            el 20 % de entrada más un ~12 % de impuestos y gastos de compraventa
          </p>
        </div>
      </div>

      <p className='text-xs text-ink-soft mt-4'>
        Estimación orientativa según la regla de endeudamiento del 35 % que recomienda el
        Banco de España. Cada entidad aplica sus propios criterios (estabilidad de ingresos,
        edad, tasación). Simula la operación completa en la{" "}
        <a href='/calculadora-hipotecaria' className='underline text-brand-blue'>
          calculadora de hipoteca
        </a>{" "}
        y revisa las{" "}
        <a href='/comparativa-hipotecas' className='underline text-brand-blue'>
          ofertas de cada banco
        </a>
        .
      </p>
    </div>
  )
}

export default PrestamoMaximoCalculator
