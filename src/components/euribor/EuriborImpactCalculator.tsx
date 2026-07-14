import React, { useMemo, useState } from "react"
import { cuotaFrancesa, getEuriborActual } from "../../utils/calculadora-hipotecaria"
import { currentEuribor } from "../../constants/euribor-values"
import Input from "../calculadora-hipotecaria/Input"
import { formatNumberByLang } from "../../utils/number-format"

// Mini-calculadora de la página /euribor: cómo cambia la cuota de una
// hipoteca variable (euríbor + diferencial) si el índice sube o baja.
const ESCENARIOS = [-1.0, -0.5, 0, 0.5, 1.0]

const LABELS = {
  es: {
    capital: 'Capital pendiente (€)',
    plazo: 'Plazo restante (años)',
    diferencial: 'Diferencial (%)',
    escenario: 'Escenario',
    euribor: 'Euríbor',
    interes: 'Tu interés',
    cuota: 'Cuota mensual',
    diferencia: 'Diferencia',
    hoy: 'Hoy',
    puntos: 'puntos',
    mes: '€/mes',
    nota: 'Cálculo orientativo por el sistema francés con revisión inmediata del índice. En una hipoteca real, el nuevo euríbor se aplica en tu próxima fecha de revisión (anual o semestral). ¿Quieres el cálculo completo con impuestos y gastos? Usa el ',
    notaLink: 'simulador de hipoteca',
    calcHref: '/calculadora-hipotecaria',
  },
  en: {
    capital: 'Outstanding balance (€)',
    plazo: 'Remaining term (years)',
    diferencial: 'Spread (%)',
    escenario: 'Scenario',
    euribor: 'Euribor',
    interes: 'Your rate',
    cuota: 'Monthly payment',
    diferencia: 'Difference',
    hoy: 'Today',
    puntos: 'points',
    mes: '€/month',
    nota: 'Indicative calculation using the French amortization system with an immediate index reset. In a real mortgage, the new Euribor applies at your next review date (annual or semi-annual). Want the full calculation with taxes and costs? Use the ',
    notaLink: 'mortgage calculator',
    calcHref: '/en/mortgage-calculator',
  },
}

interface EuriborImpactCalculatorProps {
  lang?: 'es' | 'en'
}

const EuriborImpactCalculator: React.FC<EuriborImpactCalculatorProps> = ({ lang = 'es' }) => {
  const t = LABELS[lang]
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
          label={t.capital}
          name='capital'
          value={form.capital}
          onChange={handleChange}
          type='number'
          min={0}
          showEuroSymbol={true}
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
        <Input
          label={t.diferencial}
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
              <th className='text-left py-2 px-2'>{t.escenario}</th>
              <th className='text-right py-2 px-2'>{t.euribor}</th>
              <th className='text-right py-2 px-2'>{t.interes}</th>
              <th className='text-right py-2 px-2'>{t.cuota}</th>
              <th className='text-right py-2 px-2'>{t.diferencia}</th>
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
                    ? `${t.hoy} (${lang === 'en' ? currentEuribor.labelEn : currentEuribor.labelEs})`
                    : `${fila.delta > 0 ? "+" : ""}${fila.delta.toFixed(1)} ${t.puntos}`}
                </td>
                <td className='py-2 px-2 text-right text-ink'>{fila.euribor.toFixed(2)} %</td>
                <td className='py-2 px-2 text-right text-ink-soft'>
                  {(fila.euribor + (Number(form.diferencial) || 0)).toFixed(2)} %
                </td>
                <td className='py-2 px-2 text-right text-ink'>
                  {formatNumberByLang(fila.cuota, lang)} €
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
                    : `${fila.diferencia > 0 ? "+" : ""}${formatNumberByLang(fila.diferencia, lang)} ${t.mes}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className='text-xs text-ink-soft mt-4'>
        {t.nota}
        <a href={t.calcHref} className='underline text-brand-blue'>
          {t.notaLink}
        </a>
        .
      </p>
    </div>
  )
}

export default EuriborImpactCalculator
