import React, { useMemo, useState } from "react"
import { cuotaFrancesa, getEuriborActual } from "../../utils/calculadora-hipotecaria"
import { currentEuribor } from "../../constants/euribor-values"
import Input from "../calculadora-hipotecaria/Input"
import { formatNumberByLang } from "../../utils/number-format"

// Mini-calculadora de la página /euribor: cómo cambia la cuota de una
// hipoteca variable (euríbor + diferencial) si el índice sube o baja.
const ESCENARIOS = [-1.0, -0.5, 0, 0.5, 1.0]

const EuriborImpactCalculator: React.FC = () => {
  const [form, setForm] = useState({
    capital: "150000",
    plazo: "25",
    diferencial: "1.0",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (Number(value) < 0) return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const filas = useMemo(() => {
    const capital = Number(form.capital) || 0
    const plazo = Number(form.plazo) || 0
    const diferencial = Number(form.diferencial) || 0
    const euribor = getEuriborActual()

    const cuotaActual = cuotaFrancesa(capital, euribor + diferencial, plazo)

    return ESCENARIOS.map((delta) => {
      const euriborEscenario = Math.round((euribor + delta) * 100) / 100
      const cuota = cuotaFrancesa(capital, euriborEscenario + diferencial, plazo)
      return {
        delta,
        euribor: euriborEscenario,
        cuota,
        diferencia: Math.round((cuota - cuotaActual) * 100) / 100,
      }
    })
  }, [form])

  return (
    <div className='pl-card p-5 md:p-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <Input
          label='Capital pendiente (€)'
          name='capital'
          value={form.capital}
          onChange={handleChange}
          type='number'
          min={0}
          showEuroSymbol={true}
        />
        <Input
          label='Plazo restante (años)'
          name='plazo'
          value={form.plazo}
          onChange={handleChange}
          type='number'
          min={1}
          max={40}
        />
        <Input
          label='Diferencial (%)'
          name='diferencial'
          value={form.diferencial}
          onChange={handleChange}
          type='number'
          min={0}
          step={0.01}
        />
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-line font-data text-[11px] uppercase tracking-wide text-ink-soft'>
              <th className='text-left py-2 px-2'>Escenario</th>
              <th className='text-right py-2 px-2'>Euríbor</th>
              <th className='text-right py-2 px-2'>Tu interés</th>
              <th className='text-right py-2 px-2'>Cuota mensual</th>
              <th className='text-right py-2 px-2'>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr
                key={fila.delta}
                className={`border-b border-line ${fila.delta === 0 ? "bg-paper-2/60 font-medium" : ""}`}
              >
                <td className='py-2 px-2 text-ink'>
                  {fila.delta === 0
                    ? `Hoy (${currentEuribor.labelEs})`
                    : `${fila.delta > 0 ? "+" : ""}${fila.delta.toFixed(1)} puntos`}
                </td>
                <td className='py-2 px-2 text-right text-ink'>{fila.euribor.toFixed(2)} %</td>
                <td className='py-2 px-2 text-right text-ink-soft'>
                  {(fila.euribor + (Number(form.diferencial) || 0)).toFixed(2)} %
                </td>
                <td className='py-2 px-2 text-right text-ink'>
                  {formatNumberByLang(fila.cuota, "es")} €
                </td>
                <td
                  className='py-2 px-2 text-right'
                  style={{
                    color:
                      fila.diferencia > 0
                        ? "var(--color-negative)"
                        : fila.diferencia < 0
                          ? "var(--color-positive)"
                          : "var(--color-ink-soft)",
                  }}
                >
                  {fila.diferencia === 0
                    ? "—"
                    : `${fila.diferencia > 0 ? "+" : ""}${formatNumberByLang(fila.diferencia, "es")} €/mes`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className='text-xs text-ink-soft mt-4'>
        Cálculo orientativo por el sistema francés con revisión inmediata del índice. En una
        hipoteca real, el nuevo euríbor se aplica en tu próxima fecha de revisión (anual o
        semestral). ¿Quieres el cálculo completo con impuestos y gastos? Usa el{" "}
        <a href='/calculadora-hipotecaria' className='underline text-brand-blue'>
          simulador de hipoteca
        </a>
        .
      </p>
    </div>
  )
}

export default EuriborImpactCalculator
