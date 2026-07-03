import React from "react"
import ReactECharts from "echarts-for-react"
import { euriborData } from "../../constants/euribor-values"
import { useTranslations } from "../../hooks/useTranslations"

const years = euriborData.map((d) => d.year)
const values = euriborData.map((d) => d.value)

const EuriborChart: React.FC = () => {
  const { t } = useTranslations()

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const option = {
    backgroundColor: "rgba(255,255,255,0)",
    animation: !reduced,
    toolbox: {
      show: false,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#171B26",
      borderColor: "rgba(217,242,79,.4)",
      borderWidth: 1,
      textStyle: { color: "#FAF9F4", fontFamily: "IBM Plex Mono" },
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
      axisLine: { lineStyle: { color: "rgba(250,249,244,.25)" } },
      axisLabel: { color: "rgba(250,249,244,.6)", fontFamily: "IBM Plex Mono", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "rgba(250,249,244,.25)" } },
      axisLabel: { color: "rgba(250,249,244,.6)", fontFamily: "IBM Plex Mono", fontSize: 11, formatter: "{value} %" },
      splitLine: { lineStyle: { color: "rgba(250,249,244,.08)" } },
    },
    series: [
      {
        data: values,
        type: "line",
        // smooth: true, // Quitado para que la línea sea recta entre puntos
        symbol: "circle",
        symbolSize: 7,
        lineStyle: {
          color: "#D9F24F",
          width: 2.5,
        },
        itemStyle: {
          color: "#D9F24F",
          borderColor: "#171B26",
          borderWidth: 2,
          shadowColor: "rgba(217,242,79,.6)",
          shadowBlur: 8,
        },
        areaStyle: {
          color: "rgba(217,242,79,.12)",
        },
        animationDuration: 2200,
        animationEasing: "cubicOut",
      },
    ],
  }

  return (
    <section className="w-full my-14 reveal-up">
      <div className="data-room p-6 md:p-10">
        <span className="eyebrow">{t('home.dataRoom.eyebrow')}</span>
        <h2 className="font-heading text-3xl md:text-[34px] font-semibold tracking-[-1px] text-paper mt-3">
          {t('home.dataRoom.title')} <em className="not-italic text-lime">{t('home.dataRoom.titleEm')}</em>
        </h2>
        <p className="font-data text-xs text-paper/50 mt-1 mb-6">
          {t('home.dataRoom.meta').replace('{year}', String(new Date().getFullYear()))}
        </p>
        <ReactECharts option={option} style={{ height: 380, width: "100%" }} />
        <div className="font-data text-[11px] text-paper/50 mt-3 text-center">
          {t('home.hero.source')}:{" "}
          <a href="https://data.ecb.europa.eu/data/datasets/FM/FM.M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA" target="_blank" rel="noopener noreferrer" className="underline text-lime/80">
            BCE · data.ecb.europa.eu
          </a>{" "}
          {t('home.hero.approximateAnnual')}
        </div>
      </div>
    </section>
  )
}

export default EuriborChart
