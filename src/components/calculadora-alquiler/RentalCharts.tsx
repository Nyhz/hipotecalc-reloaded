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

interface Form {
  interes: string
}

interface RentalChartsProps {
  calculations: Calculations
  form: Form
  lang?: 'es' | 'en'
}

const RentalCharts: React.FC<RentalChartsProps> = ({ calculations, form, lang = 'es' }) => {
  const { t } = useTranslations(lang)
  
  return (
    <div className="panel-card p-5 md:p-6">
      <h3 className="font-heading text-lg font-bold text-slate-900 mb-4 text-center">
        {t('rental.results.monthlyCashFlowBreakdown')}
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 metric-row bg-teal-50/80">
          <span className="font-medium text-teal-900">{t('rental.results.income')}</span>
          <span className="font-bold text-teal-900">
            {formatNumberByLang(calculations.ingresosMensuales, lang)} €
          </span>
        </div>
        <div className="flex justify-between items-center p-3 metric-row bg-pink-50/80">
          <span className="font-medium text-pink-900">{t('rental.results.mortgage')}</span>
          <span className="font-bold text-pink-900">
            -{formatNumberByLang(calculations.cuotaMensual, lang)} €
          </span>
        </div>
        <div className="flex justify-between items-center p-3 metric-row bg-pink-50/80">
          <span className="font-medium text-pink-900">{t('rental.results.expenses')}</span>
          <span className="font-bold text-pink-900">
            -{formatNumberByLang(calculations.gastosMensuales, lang)} €
          </span>
        </div>
        <div className={`flex justify-between items-center p-3 metric-row ${
          calculations.cashFlowMensual >= 0 ? 'bg-blue-50/80' : 'bg-red-50/80'
        }`}>
          <span className={`font-medium ${
            calculations.cashFlowMensual >= 0 ? 'text-blue-900' : 'text-red-900'
          }`}>{t('rental.results.cashFlow')}</span>
          <span className={`font-bold ${
            calculations.cashFlowMensual >= 0 ? 'text-blue-900' : 'text-red-900'
          }`}>
            {formatNumberByLang(calculations.cashFlowMensual, lang)} €
          </span>
        </div>
      </div>
    </div>
  )
}

export default RentalCharts 
