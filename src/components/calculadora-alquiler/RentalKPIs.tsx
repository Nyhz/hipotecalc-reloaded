import React from "react"

interface Calculations {
  roiAnual: number
  cashOnCashReturn: number
  mesesBreakEven: number
  cashFlowMensual: number
}

interface RentalKPIsProps {
  calculations: Calculations
}

const RentalKPIs: React.FC<RentalKPIsProps> = ({ calculations }) => {
  const kpis = [
    {
      title: "ROI Anual",
      value: `${calculations.roiAnual.toFixed(2)}%`,
      description: "Retorno sobre inversión anual",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-900",
    },
    {
      title: "Cash on Cash Return",
      value: `${calculations.cashOnCashReturn.toFixed(2)}%`,
      description: "Retorno sobre capital invertido",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-900",
    },
    {
      title: "Meses para Break Even",
      value: calculations.mesesBreakEven > 0 ? `${calculations.mesesBreakEven.toFixed(1)}` : "∞",
      description: "Tiempo para recuperar la entrada",
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-900",
    },
    {
      title: "Cash Flow Mensual",
      value: `${new Intl.NumberFormat("es-ES").format(calculations.cashFlowMensual)} €`,
      description: "Flujo de caja mensual neto",
      color: calculations.cashFlowMensual >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
      textColor: calculations.cashFlowMensual >= 0 ? "text-green-900" : "text-red-900",
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <h2 className="text-xl font-bold text-blue-900 mb-6">
        Métricas de Rentabilidad
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