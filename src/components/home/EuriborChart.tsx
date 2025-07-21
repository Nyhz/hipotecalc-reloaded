import React from "react"
import ReactECharts from "echarts-for-react"

// Datos de ejemplo: euribor 12 meses, últimos 25 años (1999-2024, valores aproximados)
const euriborData = [
  { year: 2000, value: 4.88 },
  { year: 2001, value: 4.57 },
  { year: 2002, value: 3.48 },
  { year: 2003, value: 2.7 },
  { year: 2004, value: 2.22 },
  { year: 2005, value: 2.31 },
  { year: 2006, value: 3.83 },
  { year: 2007, value: 4.64 },
  { year: 2008, value: 4.35 },
  { year: 2009, value: 1.24 },
  { year: 2010, value: 1.52 },
  { year: 2011, value: 2.04 },
  { year: 2012, value: 1.84 },
  { year: 2013, value: 0.54 },
  { year: 2014, value: 0.56 },
  { year: 2015, value: 0.16 },
  { year: 2016, value: -0.01 },
  { year: 2017, value: -0.19 },
  { year: 2018, value: -0.19 },
  { year: 2019, value: -0.26 },
  { year: 2020, value: -0.5 },
  { year: 2021, value: -0.5 },
  { year: 2022, value: 3.02 },
  { year: 2023, value: 3.67 },
  { year: 2024, value: 2.44 },
]

const years = euriborData.map((d) => d.year)
const values = euriborData.map((d) => d.value)

const option = {
  backgroundColor: "rgba(255,255,255,0)",
  title: {
    text: "Evolución del Euribor (2000-2024)",
    left: "center",
    textStyle: {
      color: "#1e3a8a",
      fontWeight: "bold",
      fontSize: 20,
    },
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

const EuriborChart: React.FC = () => (
  <div className='w-full max-w-6xl mx-auto px-4 my-12'>
    <div className='bg-white/80 rounded-xl shadow border border-blue-100'>
      <div className='py-6'>
        <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
        <div className='text-sm text-blue-700 mt-2 text-center'>
          Fuente:{" "}
          <a
            href='https://www.euribor-rates.eu/en/euribor-rates-by-year/'
            target='_blank'
            rel='noopener noreferrer'
            className='underline text-blue-600'
          >
            euribor-rates.eu
          </a>{" "}
          (aprox. anual, 12 meses)
        </div>
      </div>
    </div>
  </div>
)

export default EuriborChart
