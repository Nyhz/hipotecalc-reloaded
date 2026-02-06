import React from "react"
import { useTranslations } from "../../hooks/useTranslations"
import { formatNumberByLang } from "../../utils/number-format"

interface Calculations {
  roiAnual: number
  cashOnCashReturn: number
  mesesBreakEven: number
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
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-900",
    },
    {
      title: t('rental.results.cashOnCashReturn'),
      value: `${calculations.cashOnCashReturn.toFixed(2)}%`,
      description: t('rental.results.cashOnCashDescription'),
      color: "bg-green-50 border-green-200",
      textColor: "text-green-900",
    },
    {
      title: t('rental.results.monthsToBreakEven'),
      value: calculations.mesesBreakEven > 0 ? `${calculations.mesesBreakEven.toFixed(1)}` : "∞",
      description: t('rental.results.breakEvenDescription'),
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-900",
    },
    {
      title: t('rental.results.monthlyCashFlow'),
      value: `${formatNumberByLang(calculations.cashFlowMensual, lang)} €`,
      description: t('rental.results.cashFlowDescription'),
      color: calculations.cashFlowMensual >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
      textColor: calculations.cashFlowMensual >= 0 ? "text-green-900" : "text-red-900",
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <h2 className="text-xl font-bold text-blue-900 mb-6">
        {t('rental.results.profitabilityMetrics')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${kpi.color} ${kpi.textColor}`}
          >
            <div className="text-2xl font-bold mb-1">{kpi.value}</div>
            <div className="text-sm font-semibold mb-1">{kpi.title}</div>
            <div className="text-xs opacity-75">{kpi.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RentalKPIs 
