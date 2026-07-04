import React from "react"
import { useTranslations } from "../../hooks/useTranslations"
import { formatNumberByLang } from "../../utils/number-format"

interface Calculations {
  roiAnual: number
  cashOnCashReturn: number
  // null = el cash flow no es positivo y la entrada nunca se recupera
  mesesBreakEven: number | null
  cashFlowMensual: number
}

interface RentalKPIsProps {
  calculations: Calculations
  lang?: 'es' | 'en'
}

const RentalKPIs: React.FC<RentalKPIsProps> = ({ calculations, lang = 'es' }) => {
  const { t } = useTranslations(lang)
  
  const kpis = [
    {
      title: t('rental.results.annualRoi'),
      value: `${calculations.roiAnual.toFixed(2)}%`,
      description: t('rental.results.roiDescription'),
      tone: calculations.roiAnual >= 0 ? "text-positive" : "text-negative",
    },
    {
      title: t('rental.results.cashOnCashReturn'),
      value: `${calculations.cashOnCashReturn.toFixed(2)}%`,
      description: t('rental.results.cashOnCashDescription'),
      tone: calculations.cashOnCashReturn >= 0 ? "text-positive" : "text-negative",
    },
    {
      title: t('rental.results.monthsToBreakEven'),
      value: calculations.mesesBreakEven !== null ? `${calculations.mesesBreakEven.toFixed(1)}` : "∞",
      description: t('rental.results.breakEvenDescription'),
      tone: "text-ink",
    },
    {
      title: t('rental.results.monthlyCashFlow'),
      value: `${formatNumberByLang(calculations.cashFlowMensual, lang)} €`,
      description: t('rental.results.cashFlowDescription'),
      tone: calculations.cashFlowMensual >= 0 ? "text-positive" : "text-negative",
    },
  ]

  return (
    <div className="pl-card p-5 md:p-6">
      <h2 className="font-heading text-xl font-bold text-ink mb-6">
        {t('rental.results.profitabilityMetrics')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="pl-card p-4">
            <div className={`font-heading text-2xl font-bold mb-1 ${kpi.tone}`}>{kpi.value}</div>
            <div className="font-data text-[10.5px] uppercase tracking-widest text-ink-soft mb-1">{kpi.title}</div>
            <div className="text-xs text-ink-soft">{kpi.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RentalKPIs 
