// Actualiza src/constants/euribor-values.ts con datos del BCE (Data Portal).
// Series: euríbor a 12 meses, media de observaciones del periodo (FM dataset).
//   - Anual:   FM/A.U2.EUR.RT.MM.EURIBOR1YD_.HSTA
//   - Mensual: FM/M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA
// Sin dependencias; requiere Node 18+.

import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const API = "https://data-api.ecb.europa.eu/service/data/FM"
const SERIES_ANNUAL = "A.U2.EUR.RT.MM.EURIBOR1YD_.HSTA"
const SERIES_MONTHLY = "M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA"
const START_YEAR = 2000
const OUT_PATH = fileURLToPath(new URL("../src/constants/euribor-values.ts", import.meta.url))

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Las columnas TIME_PERIOD (8) y OBS_VALUE (9) van antes de cualquier campo
// entrecomillado del CSV, así que un split por comas es seguro.
async function fetchSeries(seriesKey, startPeriod) {
  const url = `${API}/${seriesKey}?format=csvdata&startPeriod=${startPeriod}`
  const res = await fetch(url, { headers: { Accept: "text/csv" } })
  if (!res.ok) throw new Error(`ECB API ${res.status} en ${url}`)
  const lines = (await res.text()).trim().split("\n").slice(1)
  return lines
    .map((line) => {
      const cols = line.split(",")
      return { period: cols[8], value: Number(cols[9]) }
    })
    .filter((row) => row.period && Number.isFinite(row.value))
}

const round2 = (n) => Math.round(n * 100) / 100

const annual = await fetchSeries(SERIES_ANNUAL, START_YEAR)
if (annual.length < 20) throw new Error(`Serie anual sospechosamente corta (${annual.length} filas)`)

const lastAnnualYear = Math.max(...annual.map((r) => Number(r.period)))
// Pedir la serie mensual desde el último año completo, no desde el siguiente:
// en enero (Y+1)-01 aún no tiene observaciones (el BCE publica dic y la media
// anual de Y a la vez) y la petición devolvería un 200 vacío.
const monthly = await fetchSeries(SERIES_MONTHLY, `${lastAnnualYear}-01`)
if (monthly.length === 0) throw new Error("Serie mensual vacía tras el último año completo")

const points = annual
  .map((r) => ({ year: Number(r.period), value: round2(r.value) }))
  .sort((a, b) => a.year - b.year)

// Año en curso: media parcial de los meses ya publicados. Los años que ya
// tienen media anual oficial se omiten (la serie mensual empieza en
// lastAnnualYear solo para poder derivar el euríbor actual en enero).
const byYear = new Map()
for (const row of monthly) {
  const year = Number(row.period.slice(0, 4))
  if (year <= lastAnnualYear) continue
  if (!byYear.has(year)) byYear.set(year, [])
  byYear.get(year).push(row.value)
}
for (const [year, values] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
  points.push({
    year,
    value: round2(values.reduce((a, b) => a + b, 0) / values.length),
    partial: true,
  })
}

const latest = monthly[monthly.length - 1]
const [latestYear, latestMonth] = latest.period.split("-").map(Number)
const currentEuribor = {
  value: round2(latest.value),
  period: latest.period,
  labelEs: `${MONTHS_ES[latestMonth - 1]} ${latestYear}`,
  labelEn: `${MONTHS_EN[latestMonth - 1]} ${latestYear}`,
}

const dataLines = points
  .map((p) => `  { year: ${p.year}, value: ${p.value}${p.partial ? ", partial: true" : ""} },`)
  .join("\n")

const output = `// AUTO-GENERADO por scripts/update-euribor.mjs — no editar a mano.
// Fuente: BCE Data Portal (data.ecb.europa.eu), euríbor a 12 meses.
// Serie anual: media del año. El año en curso (partial) es la media de los
// meses publicados hasta la fecha.

export interface EuriborPoint {
  year: number
  value: number
  partial?: boolean
}

export const euriborData: EuriborPoint[] = [
${dataLines}
]

// Última media mensual publicada por el BCE.
export const currentEuribor = {
  value: ${currentEuribor.value},
  period: "${currentEuribor.period}",
  labelEs: "${currentEuribor.labelEs}",
  labelEn: "${currentEuribor.labelEn}",
}
`

writeFileSync(OUT_PATH, output)
console.log(`OK: ${points.length} años (último completo ${lastAnnualYear}), euríbor actual ${currentEuribor.value}% (${currentEuribor.period})`)
