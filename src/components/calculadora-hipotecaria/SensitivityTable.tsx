import React, { useState, useMemo } from "react"
import { COMUNIDADES } from "../../constants/comunidades"
import { calcularITP, calcularIVA, calcularTIN, getEuriborActual, calcularInteresVariable } from "../../utils/calculadora-hipotecaria"
import { useTranslations } from "../../hooks/useTranslations"

interface SensitivityTableProps {
  form: {
    precio: string
    ahorro: string
    tae: string
    plazo: string
    tipoHipoteca: string
    diferencial?: string
    comunidad: string
    tipoVivienda: string
    otrosCostes: string
  }
  calculations: {
    cuota: number
    tin: number
    impuesto: number
    esObraNueva: boolean
  }
  itpCalculado?: boolean
  itpTipoAplicado?: number | null
  itpDescripcion?: string
}

const SensitivityTable: React.FC<SensitivityTableProps> = ({ 
  form, 
  calculations, 
  itpCalculado = false, 
  itpTipoAplicado = null, 
  itpDescripcion = "" 
}) => {
  const { t } = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)
  const [stepPrecio, setStepPrecio] = useState("10000")
  const [stepAhorro, setStepAhorro] = useState("5000")

  const sensitivityData = useMemo(() => {
    const precioActual = Number(form.precio) || 0
    const ahorroActual = Number(form.ahorro) || 0
    const taeActual = Number(form.tae) || 0
    const plazoActual = Number(form.plazo) || 30
    const diferencialActual = Number(form.diferencial) || 0
    const otrosCostesActual = Number(form.otrosCostes) || 0
    const esHipotecaVariable = form.tipoHipoteca === "Variable"
    const esObraNueva = form.tipoVivienda === "Obra nueva"

    const stepPrecioNum = Number(stepPrecio) || 10000
    const stepAhorroNum = Number(stepAhorro) || 5000

    // Generar rangos de precios (±2 steps en incrementos configurables)
    const precios = [
      precioActual - (stepPrecioNum * 2),  // -2 steps
      precioActual - stepPrecioNum,        // -1 step
      precioActual,                         // Actual
      precioActual + stepPrecioNum,        // +1 step
      precioActual + (stepPrecioNum * 2),  // +2 steps
    ]

    // Generar rangos de ahorro (±2 steps en incrementos configurables)
    const ahorros = [
      ahorroActual - (stepAhorroNum * 2),  // -2 steps
      ahorroActual - stepAhorroNum,        // -1 step
      ahorroActual,                         // Actual
      ahorroActual + stepAhorroNum,        // +1 step
      ahorroActual + (stepAhorroNum * 2),  // +2 steps
    ]

    // Función para calcular impuestos (igual que en la calculadora principal)
    const calcularImpuesto = (precio: number) => {
      let impuesto: number
      
      if (itpCalculado && itpTipoAplicado !== null) {
        // Usar el valor calculado del modal
        impuesto = precio * (itpTipoAplicado / 100)
      } else {
        // Cálculo automático por defecto
        if (esObraNueva) {
          impuesto = calcularIVA(precio, 10)
        } else {
          // Obtener el porcentaje de ITP de la comunidad seleccionada
          const comunidadSeleccionada = COMUNIDADES.find(
            (c) => c.nombre === form.comunidad
          )
          const porcentajeITP = comunidadSeleccionada?.ITP || 6
          impuesto = calcularITP(precio, porcentajeITP)
        }
      }
      
      return impuesto
    }

    // Función para calcular cuota (siguiendo exactamente el mismo flujo)
    const calcularCuota = (precio: number, ahorro: number) => {
      if (precio <= 0 || ahorro < 0) return 0

      // 1. Calcular impuestos
      const impuesto = calcularImpuesto(precio)
      
      // 2. Calcular precio final (precio + otros costes + impuestos)
      const precioFinal = precio + otrosCostesActual + impuesto
      
      // 3. Calcular cantidad de hipoteca
      const cantidadHipoteca = Math.max(0, precioFinal - ahorro)
      if (cantidadHipoteca <= 0) return 0

      // 4. Calcular TIN según tipo de hipoteca
      let tin: number
      if (esHipotecaVariable) {
        // Para hipotecas variables: usar diferencial + Euribor actual
        const euriborActual = getEuriborActual()
        tin = calcularInteresVariable(euriborActual, diferencialActual)
      } else {
        // Para hipotecas fijas: convertir TAE a TIN
        tin = calcularTIN(taeActual)
      }

      // 5. Calcular cuota mensual
      const tinMensual = tin / 100 / 12
      const numPagos = plazoActual * 12

      if (tinMensual === 0) {
        return cantidadHipoteca / numPagos
      }

      const cuota =
        (cantidadHipoteca * (tinMensual * Math.pow(1 + tinMensual, numPagos))) /
        (Math.pow(1 + tinMensual, numPagos) - 1)

      return Math.round(cuota * 100) / 100
    }

    // Generar matriz de cuotas
    const matriz = ahorros.map(ahorro => 
      precios.map(precio => calcularCuota(precio, ahorro))
    )

    return {
      precios,
      ahorros,
      matriz,
      precioActual,
      ahorroActual,
      stepPrecioNum,
      stepAhorroNum
    }
  }, [form, calculations, itpCalculado, itpTipoAplicado, itpDescripcion, stepPrecio, stepAhorro])

  if (!isExpanded) {
    return (
      <div className="mt-6">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full pl-card pl-card-hover p-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                {t('mortgage.form.sensitivityAnalysis')}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {t('mortgage.form.sensitivityAnalysisDescription')}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-blue-600 transform transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="pl-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              {t('mortgage.form.sensitivityAnalysis')}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {t('mortgage.form.sensitivityAnalysisDescription')}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Inputs para configurar los steps */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              {t('mortgage.form.priceStep')}
            </label>
            <input
              type="number"
              value={stepPrecio}
              onChange={(e) => setStepPrecio(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 10000`}
              min="1000"
              step="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              {t('mortgage.form.savingsStep')}
            </label>
            <input
              type="number"
              value={stepAhorro}
              onChange={(e) => setStepAhorro(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`${t('mortgage.form.itpModal.examplePlaceholder')} 5000`}
              min="1000"
              step="1000"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-300">
                <th className="text-left py-2 px-2 font-medium text-blue-900">
                  {t('mortgage.form.savings')} / {t('mortgage.form.price')}
                </th>
                {sensitivityData.precios.map((precio, index) => (
                  <th key={index} className="text-right py-2 px-2 font-medium text-blue-900">
                    {index === 2 ? (
                      <span className="font-data text-blue-700 font-bold">
                        {new Intl.NumberFormat("es-ES").format(precio)} €
                      </span>
                    ) : (
                      <span className={index < 2 ? "text-red-600" : "text-green-600"}>
                        {new Intl.NumberFormat("es-ES").format(precio)} €
                      </span>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {index === 2 ? t('mortgage.form.current') : index < 2 ? `-${((2 - index) * sensitivityData.stepPrecioNum).toLocaleString()}€` : `+${((index - 2) * sensitivityData.stepPrecioNum).toLocaleString()}€`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensitivityData.ahorros.map((ahorro, rowIndex) => (
                <tr key={rowIndex} className="border-b border-blue-200">
                  <td className="py-2 px-2 font-medium text-blue-900">
                    {rowIndex === 2 ? (
                      <span className="font-data text-blue-700 font-bold">
                        {new Intl.NumberFormat("es-ES").format(ahorro)} €
                      </span>
                    ) : (
                      <span className={rowIndex < 2 ? "text-red-600" : "text-green-600"}>
                        {new Intl.NumberFormat("es-ES").format(ahorro)} €
                      </span>
                    )}
                    <div className="text-xs text-gray-500">
                      {rowIndex === 2 ? t('mortgage.form.current') : rowIndex < 2 ? `-${((2 - rowIndex) * sensitivityData.stepAhorroNum).toLocaleString()}€` : `+${((rowIndex - 2) * sensitivityData.stepAhorroNum).toLocaleString()}€`}
                    </div>
                  </td>
                  {sensitivityData.matriz[rowIndex].map((cuota, colIndex) => (
                    <td key={colIndex} className="text-right py-2 px-2">
                      <span className={`font-medium ${
                        rowIndex === 2 && colIndex === 2
                          ? "font-data text-blue-700 font-bold"
                          : "text-gray-700"
                      }`}>
                        {new Intl.NumberFormat("es-ES").format(cuota)} €
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-gray-600">
          <p>• {t('mortgage.form.redValues')}: {t('mortgage.form.reductionByStep')}</p>
          <p>• {t('mortgage.form.blueValues')}: {t('mortgage.form.currentValues')}</p>
          <p>• {t('mortgage.form.greenValues')}: {t('mortgage.form.increaseByStep')}</p>
        </div>
      </div>
    </div>
  )
}

export default SensitivityTable 