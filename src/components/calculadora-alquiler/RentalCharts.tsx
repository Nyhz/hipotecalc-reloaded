import React from "react"
import { useTranslations } from "../../hooks/useTranslations"
import { formatNumberByLang } from "../../utils/number-format"

interface Calculations {
  ingresosMensuales: number
  cuotaMensual: number
  gastosMensuales: number
  cashFlowMensual: number
  roiAnual: number
  cashOnCashReturn: number
}

interface RentalChartsProps {
  calculations: Calculations
  lang?: 'es' | 'en'
}

const RentalCharts: React.FC<RentalChartsProps> = ({ calculations, lang = 'es' }) => {
  const { t } = useTranslations(lang)
  
  return (
    <div className="pl-card p-5 md:p-6">
      <h3 className="font-heading text-lg font-bold text-ink mb-4 text-center">
        {t('rental.results.monthlyCashFlowBreakdown')}
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center rounded-xl border border-line bg-paper/50 p-3">
          <span className="font-data text-[11px] uppercase tracking-widest text-ink-soft">{t('rental.results.income')}</span>
          <span className="font-data font-semibold text-positive">
            {formatNumberByLang(calculations.ingresosMensuales, lang)} €
          </span>
        </div>
        <div className="flex justify-between items-center rounded-xl border border-line bg-paper/50 p-3">
          <span className="font-data text-[11px] uppercase tracking-widest text-ink-soft">{t('rental.results.mortgage')}</span>
          <span className="font-data font-semibold text-negative">
            -{formatNumberByLang(calculations.cuotaMensual, lang)} €
          </span>
        </div>
        <div className="flex justify-between items-center rounded-xl border border-line bg-paper/50 p-3">
          <span className="font-data text-[11px] uppercase tracking-widest text-ink-soft">{t('rental.results.expenses')}</span>
          <span className="font-data font-semibold text-negative">
            -{formatNumberByLang(calculations.gastosMensuales, lang)} €
          </span>
        </div>
        <div className="flex justify-between items-center rounded-xl border border-line bg-paper/80 p-3">
          <span className="font-data text-[11px] uppercase tracking-widest text-ink">{t('rental.results.cashFlow')}</span>
          <span className={`font-data font-bold ${
            calculations.cashFlowMensual >= 0 ? 'text-positive' : 'text-negative'
          }`}>
            {formatNumberByLang(calculations.cashFlowMensual, lang)} €
          </span>
        </div>
      </div>
    </div>
  )
}

export default RentalCharts 
