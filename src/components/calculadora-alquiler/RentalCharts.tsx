import React from "react"
import { useTranslations } from "../../hooks/useTranslations"

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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <h3 className="text-lg font-bold text-blue-900 mb-4 text-center">
        {t('rental.results.monthlyCashFlowBreakdown')}
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-teal-50 rounded">
          <span className="font-medium text-teal-900">{t('rental.results.income')}</span>
          <span className="font-bold text-teal-900">
            {new Intl.NumberFormat("es-ES").format(calculations.ingresosMensuales)} €
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-pink-50 rounded">
          <span className="font-medium text-pink-900">{t('rental.results.mortgage')}</span>
          <span className="font-bold text-pink-900">
            -{new Intl.NumberFormat("es-ES").format(calculations.cuotaMensual)} €
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-pink-50 rounded">
          <span className="font-medium text-pink-900">{t('rental.results.expenses')}</span>
          <span className="font-bold text-pink-900">
            -{new Intl.NumberFormat("es-ES").format(calculations.gastosMensuales)} €
          </span>
        </div>
        <div className={`flex justify-between items-center p-3 rounded ${
          calculations.cashFlowMensual >= 0 ? 'bg-blue-50' : 'bg-red-50'
        }`}>
          <span className={`font-medium ${
            calculations.cashFlowMensual >= 0 ? 'text-blue-900' : 'text-red-900'
          }`}>{t('rental.results.cashFlow')}</span>
          <span className={`font-bold ${
            calculations.cashFlowMensual >= 0 ? 'text-blue-900' : 'text-red-900'
          }`}>
            {new Intl.NumberFormat("es-ES").format(calculations.cashFlowMensual)} €
          </span>
        </div>
      </div>
    </div>
  )
}

export default RentalCharts 