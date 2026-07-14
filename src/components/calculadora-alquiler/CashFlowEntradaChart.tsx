import React, { Suspense, lazy, useMemo } from "react"
import { cuotaFrancesa } from "../../utils/calculadora-hipotecaria"
import { formatNumberByLang } from "../../utils/number-format"
import ChartErrorBoundary from "../ui/ChartErrorBoundary"

// Carga diferida: echarts (~1 MB) no debe entrar en el bundle inicial
const ReactECharts = lazy(() => import("echarts-for-react"))

interface CashFlowEntradaChartProps {
  /** Coste total de adquisición: precio + ITP */
  precioTotal: number
  interes: number
  plazo: number
  ingresosMensuales: number
  gastosMensuales: number
  entradaActual: number
  lang?: "es" | "en"
}

const LABELS = {
  es: {
    titulo: "Cash flow según la entrada que aportes",
    descripcion:
      "Cuanta más entrada, menos hipoteca y mejor cash flow mensual. Pasa el cursor por la curva para ver cada escenario; el punto marca tu entrada actual.",
    entrada: "Entrada",
    cuota: "Cuota hipoteca",
    cashFlow: "Cash flow neto",
    tuEntrada: "Tu entrada",
    breakEven: "Cash flow 0",
  },
  en: {
    titulo: "Cash flow by down payment",
    descripcion:
      "A larger down payment means a smaller mortgage and better monthly cash flow. Hover over the curve to inspect each scenario; the dot marks your current down payment.",
    entrada: "Down payment",
    cuota: "Mortgage payment",
    cashFlow: "Net cash flow",
    tuEntrada: "Your down payment",
    breakEven: "Break-even",
  },
}

const CashFlowEntradaChart: React.FC<CashFlowEntradaChartProps> = ({
  precioTotal,
  interes,
  plazo,
  ingresosMensuales,
  gastosMensuales,
  entradaActual,
  lang = "es",
}) => {
  const t = LABELS[lang]

  const option = useMemo(() => {
    if (precioTotal <= 0) return null

    // Barrido de la entrada de 0 al coste total en 40 pasos
    const pasos = 40
    const puntos: { entrada: number; cuota: number; cashFlow: number }[] = []
    for (let i = 0; i <= pasos; i++) {
      const entrada = Math.round((precioTotal * i) / pasos)
      const cuota = cuotaFrancesa(Math.max(0, precioTotal - entrada), interes, plazo)
      const cashFlow = Math.round((ingresosMensuales - gastosMensuales - cuota) * 100) / 100
      puntos.push({ entrada, cuota, cashFlow })
    }

    const entradaClamped = Math.min(Math.max(entradaActual, 0), precioTotal)
    const cuotaActual = cuotaFrancesa(Math.max(0, precioTotal - entradaClamped), interes, plazo)
    const cashFlowActual =
      Math.round((ingresosMensuales - gastosMensuales - cuotaActual) * 100) / 100

    const fmt = (n: number) => formatNumberByLang(n, lang)

    return {
      backgroundColor: "rgba(255,255,255,0)",
      grid: { left: "3%", right: "4%", top: 30, bottom: "10%", containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#171B26",
        borderColor: "rgba(217,242,79,.4)",
        borderWidth: 1,
        textStyle: { color: "#FAF9F4", fontFamily: "IBM Plex Mono", fontSize: 12 },
        formatter: (params: any[]) => {
          const p = params[0]
          const punto = puntos[p.dataIndex]
          if (!punto) return ""
          return [
            `<b>${t.entrada}: ${fmt(punto.entrada)} €</b>`,
            `${t.cuota}: ${fmt(punto.cuota)} €/mes`,
            `${t.cashFlow}: <b>${punto.cashFlow >= 0 ? "+" : ""}${fmt(punto.cashFlow)} €/mes</b>`,
          ].join("<br/>")
        },
      },
      xAxis: {
        type: "category",
        name: `${t.entrada} (€)`,
        nameLocation: "middle",
        nameGap: 28,
        nameTextStyle: { color: "#4a5061", fontFamily: "IBM Plex Mono", fontSize: 11 },
        data: puntos.map((p) => p.entrada),
        axisLine: { lineStyle: { color: "rgba(23,27,38,.25)" } },
        axisLabel: {
          color: "#4a5061",
          fontFamily: "IBM Plex Mono",
          fontSize: 10,
          formatter: (v: string) => `${Math.round(Number(v) / 1000)}k`,
        },
      },
      yAxis: {
        type: "value",
        name: `${t.cashFlow} (€/mes)`,
        nameTextStyle: { color: "#4a5061", fontFamily: "IBM Plex Mono", fontSize: 11 },
        axisLine: { lineStyle: { color: "rgba(23,27,38,.25)" } },
        axisLabel: { color: "#4a5061", fontFamily: "IBM Plex Mono", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(23,27,38,.08)" } },
      },
      series: [
        {
          type: "line",
          data: puntos.map((p) => p.cashFlow),
          smooth: true,
          symbol: "circle",
          symbolSize: 4,
          showSymbol: false,
          lineStyle: { color: "#2a4cf0", width: 2.5 },
          itemStyle: { color: "#2a4cf0" },
          areaStyle: { color: "rgba(42,76,240,.08)" },
          markLine: {
            silent: true,
            symbol: "none",
            data: [
              {
                yAxis: 0,
                lineStyle: { color: "rgba(23,27,38,.45)", type: "dashed" },
                label: {
                  formatter: t.breakEven,
                  color: "#4a5061",
                  fontFamily: "IBM Plex Mono",
                  fontSize: 10,
                },
              },
            ],
          },
          markPoint: {
            symbol: "circle",
            symbolSize: 11,
            itemStyle: { color: "#d9f24f", borderColor: "#171b26", borderWidth: 2 },
            label: {
              formatter: t.tuEntrada,
              position: "top",
              color: "#171b26",
              fontFamily: "IBM Plex Mono",
              fontSize: 10,
            },
            data: [
              {
                coord: [
                  // índice del paso más cercano a la entrada actual
                  Math.round((entradaClamped / precioTotal) * pasos),
                  cashFlowActual,
                ],
              },
            ],
          },
        },
      ],
    }
  }, [precioTotal, interes, plazo, ingresosMensuales, gastosMensuales, entradaActual, lang])

  if (!option) return null

  return (
    <div className='pl-card p-5 md:p-6'>
      <h2 className='font-heading text-xl font-bold text-ink mb-1'>{t.titulo}</h2>
      <p className='text-sm text-ink-soft mb-4'>{t.descripcion}</p>
      <ChartErrorBoundary fallback={<div style={{ height: 320, width: "100%" }} />}>
        <Suspense fallback={<div style={{ height: 320, width: "100%" }} />}>
          <ReactECharts
            option={option}
            style={{ height: 320, width: "100%" }}
            notMerge={true}
            onChartReady={(chart: { resize: () => void }) => {
              // Si el contenedor aún no tenía layout al montar (client:visible,
              // pestañas en segundo plano), echarts se inicializa a 100px:
              // remedir en el siguiente frame lo corrige
              setTimeout(() => chart.resize(), 50)
            }}
          />
        </Suspense>
      </ChartErrorBoundary>
    </div>
  )
}

export default CashFlowEntradaChart
