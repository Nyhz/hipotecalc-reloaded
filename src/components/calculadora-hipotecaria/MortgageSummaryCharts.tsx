import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { useTranslations } from '../../hooks/useTranslations'

interface MortgageSummaryChartsProps {
  precioInmueble: number
  impuestosGastos: number
  ahorroAportado: number
  cantidadHipoteca: number
  interesTotal: number
}

const MortgageSummaryCharts: React.FC<MortgageSummaryChartsProps> = ({
  precioInmueble,
  impuestosGastos,
  ahorroAportado,
  cantidadHipoteca,
  interesTotal,
}) => {
  const { t } = useTranslations()
  const costChartRef = useRef<HTMLDivElement>(null)
  const mortgageChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!costChartRef.current || !mortgageChartRef.current) return

    // Gráfica 1: Desglose del coste total del inmueble
    const costChart = echarts.init(costChartRef.current)
    const costOption = {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `${params.seriesName}: ${new Intl.NumberFormat('es-ES').format(params.value)} €`
        }
      },
      grid: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      xAxis: {
        type: 'value',
        show: false,
        max: precioInmueble + impuestosGastos
      },
      yAxis: {
        type: 'category',
        data: [''],
        show: false
      },
      series: [
        {
          name: t('mortgage.form.charts.propertyPrice'),
          type: 'bar',
          stack: 'total',
          data: [precioInmueble],
          itemStyle: { color: '#FFD700' },
          barWidth: '100%'
        },
        {
          name: t('mortgage.form.charts.taxesAndExpenses'),
          type: 'bar',
          stack: 'total',
          data: [impuestosGastos],
          itemStyle: { color: '#FFA500' }
        }
      ]
    }
    costChart.setOption(costOption)

    // Gráfica 2: Desglose del coste total con hipoteca
    const mortgageChart = echarts.init(mortgageChartRef.current)
    const mortgageOption = {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `${params.seriesName}: ${new Intl.NumberFormat('es-ES').format(params.value)} €`
        }
      },
      grid: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      xAxis: {
        type: 'value',
        show: false,
        max: ahorroAportado + cantidadHipoteca + interesTotal
      },
      yAxis: {
        type: 'category',
        data: [''],
        show: false
      },
      series: [
        {
          name: t('mortgage.form.charts.savingsContributed'),
          type: 'bar',
          stack: 'total',
          data: [ahorroAportado],
          itemStyle: { color: '#87CEEB' },
          barWidth: '100%'
        },
        {
          name: t('mortgage.form.charts.mortgage'),
          type: 'bar',
          stack: 'total',
          data: [cantidadHipoteca],
          itemStyle: { color: '#4682B4' }
        },
        {
          name: t('mortgage.form.charts.interest'),
          type: 'bar',
          stack: 'total',
          data: [interesTotal],
          itemStyle: { color: '#2F4F4F' }
        }
      ]
    }
    mortgageChart.setOption(mortgageOption)

    // Cleanup
    return () => {
      costChart.dispose()
      mortgageChart.dispose()
    }
  }, [precioInmueble, impuestosGastos, ahorroAportado, cantidadHipoteca, interesTotal])

  return (
    <div className="space-y-4">
      {/* Gráfica 1: Coste total del inmueble */}
      <div className="pl-card p-3">
        <h3 className="text-base font-semibold text-slate-800 mb-2">
          {t('mortgage.form.charts.totalPropertyCost')}
        </h3>
        <div className="space-y-2">
          <div ref={costChartRef} className="w-full h-8 bg-gray-100 rounded" />
          <div className="space-y-1.5">
            <div className="flex justify-between items-center rounded-xl border border-line bg-paper/60 px-3 py-2">
              <span className="text-sm text-gray-600">{t('mortgage.form.charts.propertyPrice')}</span>
              <span className="font-semibold text-sm">
                {new Intl.NumberFormat('es-ES').format(precioInmueble)} €
              </span>
            </div>
            <div className="flex justify-between items-center rounded-xl border border-line bg-paper/60 px-3 py-2">
              <span className="text-sm text-gray-600">{t('mortgage.form.charts.taxesAndExpenses')}</span>
              <span className="font-semibold text-sm">
                {new Intl.NumberFormat('es-ES').format(impuestosGastos)} €
              </span>
            </div>
            <div className="flex justify-between items-center rounded-xl border border-line bg-paper/60 px-3 py-2">
              <span className="font-semibold text-gray-800">{t('mortgage.form.charts.total')}</span>
              <span className="font-data font-bold">
                {new Intl.NumberFormat('es-ES').format(precioInmueble + impuestosGastos)} €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica 2: Coste total con hipoteca */}
      <div className="pl-card p-3">
        <h3 className="text-base font-semibold text-slate-800 mb-2">
          {t('mortgage.form.charts.totalCostWithMortgage')}
        </h3>
        <div className="space-y-2">
          <div ref={mortgageChartRef} className="w-full h-8 bg-gray-100 rounded" />
          <div className="space-y-1.5">
            <div className="flex justify-between items-center rounded-xl border border-line bg-paper/60 px-3 py-2">
              <span className="text-sm text-gray-600">{t('mortgage.form.charts.savingsContributed')}</span>
              <span className="font-semibold text-sm">
                {new Intl.NumberFormat('es-ES').format(ahorroAportado)} €
              </span>
            </div>
            <div className="flex justify-between items-center rounded-xl border border-line bg-paper/60 px-3 py-2">
              <span className="text-sm text-gray-600">{t('mortgage.form.charts.mortgage')}</span>
              <span className="font-semibold text-sm">
                {new Intl.NumberFormat('es-ES').format(cantidadHipoteca)} €
              </span>
            </div>
            <div className="flex justify-between items-center rounded-xl border border-line bg-paper/60 px-3 py-2">
              <span className="text-sm text-gray-600">{t('mortgage.form.charts.interest')}</span>
              <span className="font-semibold text-sm">
                {new Intl.NumberFormat('es-ES').format(interesTotal)} €
              </span>
            </div>
            <div className="flex justify-between items-center rounded-xl border border-line bg-paper/60 px-3 py-2">
              <span className="font-semibold text-gray-800">{t('mortgage.form.charts.total')}</span>
              <span className="font-data font-bold">
                {new Intl.NumberFormat('es-ES').format(ahorroAportado + cantidadHipoteca + interesTotal)} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MortgageSummaryCharts 
