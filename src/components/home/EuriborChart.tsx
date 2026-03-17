import React from "react"
import ReactECharts from "echarts-for-react"
import { euriborData } from "../../constants/euribor-values"
import { useTranslations } from "../../hooks/useTranslations"

const years = euriborData.map((d) => d.year)
const values = euriborData.map((d) => d.value)

const EuriborChart: React.FC = () => {
  const { t } = useTranslations()

  const option = {
    backgroundColor: "rgba(255,255,255,0)",
    title: {
      text: t('home.hero.euriborEvolution'),
      left: "center",
      textStyle: {
        color: "#1e3a8a",
        fontWeight: "bold",
        fontSize: 20,
      },
    },
    toolbox: {
      show: false,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#3b82f6",
      borderWidth: 1,
      textStyle: { color: "#1e3a8a" },
      formatter: (params: any[]) => {
        const p = params[0]
        return `<b>${p.axisValue}</b>: ${p.data} %`
      },
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "10%",
      top: 60,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: years,
      axisLine: { lineStyle: { color: "#3b82f6" } },
      axisLabel: { color: "#1e3a8a", fontWeight: 600 },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#3b82f6" } },
      axisLabel: { color: "#1e3a8a", fontWeight: 600, formatter: "{value} %" },
      splitLine: { lineStyle: { color: "#e0e7ef" } },
    },
    series: [
      {
        data: values,
        type: "line",
        // smooth: true, // Quitado para que la línea sea recta entre puntos
        symbol: "circle",
        symbolSize: 7,
        lineStyle: {
          color: "#2563eb",
          width: 3,
        },
        itemStyle: {
          color: "#2563eb",
          borderColor: "#fff",
          borderWidth: 2,
          shadowColor: "#2563eb",
          shadowBlur: 6,
        },
        areaStyle: {
          color: "rgba(59,130,246,0.08)",
        },
      },
    ],
  }

  return (
    <div className='w-full max-w-[1920px] mx-auto my-12 reveal-up'>
      <div className='surface-card p-4 md:p-6'>
        <div className='py-2'>
          <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
          <div className='text-sm text-slate-600 mt-2 text-center'>
            {t('home.hero.source')}:{" "}
            <a
              href='https://www.euribor-rates.eu/en/euribor-rates-by-year/'
              target='_blank'
              rel='noopener noreferrer'
              className='underline text-blue-700 cursor-pointer'
            >
              euribor-rates.eu
            </a>{" "}
            {t('home.hero.approximateAnnual')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EuriborChart
