// Import shared functions
import { calcularITP, calcularIVA } from "./common-calculators"

// Re-export shared functions
export { calcularITP, calcularIVA }

// Re-export ITP advanced function
export { calcularITPAvanzado } from "./calculadora-itp"

// Import Euribor data
import { euriborData, currentEuribor } from "../constants/euribor-values"

// Import i18n for translations
import { t, type Language } from "./i18n"

// Mortgage calculator specific types and functions
interface MortgageParams {
  precio: string
  tasacion: string
  comunidad: string
  tipoVivienda: string
  otrosCostes: string
  ahorro: string
  tipoHipoteca: string
  tae: string
  plazo: string
  cantidadHipoteca: number
  tin: number
}

export function cuotaMensual(params: MortgageParams): number {
  const { cantidadHipoteca, tin, plazo } = params

  // Guardas numéricas: plazo "0" es truthy y dividiría por cero, y tin 0 es
  // un tipo válido que debe llegar a la rama de interés cero
  const numPagos = Number(plazo) * 12
  if (!cantidadHipoteca || numPagos <= 0 || !Number.isFinite(tin)) return 0

  const tinMensual = tin / 100 / 12

  if (tinMensual === 0) {
    return cantidadHipoteca / numPagos
  }

  const cuota =
    (cantidadHipoteca * (tinMensual * Math.pow(1 + tinMensual, numPagos))) /
    (Math.pow(1 + tinMensual, numPagos) - 1)

  return Math.round(cuota * 100) / 100
}

export function porcentajeFinanciado(params: MortgageParams): number {
  const { cantidadHipoteca, precio } = params

  if (!cantidadHipoteca || !precio) return 0

  const precioNum = Number(precio)
  if (precioNum === 0) return 0

  const porcentaje = (cantidadHipoteca / precioNum) * 100
  return Math.round(porcentaje * 100) / 100
}

export function interesTotal(params: MortgageParams): number {
  const { cantidadHipoteca, tin, plazo } = params

  const numPagos = Number(plazo) * 12
  if (!cantidadHipoteca || numPagos <= 0 || !Number.isFinite(tin)) return 0

  const cuota = cuotaMensual(params)
  const totalPagado = cuota * numPagos
  const interes = totalPagado - cantidadHipoteca

  return Math.round(interes * 100) / 100
}

export function importeTotal(params: MortgageParams): number {
  const { cantidadHipoteca, tin, plazo } = params

  const numPagos = Number(plazo) * 12
  if (!cantidadHipoteca || numPagos <= 0 || !Number.isFinite(tin)) return 0

  const cuota = cuotaMensual(params)
  const total = cuota * numPagos

  return Math.round(total * 100) / 100
}

export function calcularTIN(tae: number): number {
  if (!tae || tae <= 0) return 0

  const taeDecimal = tae / 100
  const tinDecimal = (Math.pow(1 + taeDecimal, 1 / 12) - 1) * 12
  const tin = tinDecimal * 100

  return (tin * 100) / 100
}

// Funciones para hipotecas variables
export const getEuriborActual = (): number => {
  // Última media mensual publicada por el BCE
  return currentEuribor.value
}

export const getEuriborHistorico = (periodoAnos: number): { min: number; max: number } => {
  const currentYear = new Date().getFullYear()
  // +1: un periodo de N años debe abarcar N años naturales incluyendo el actual
  const startYear = currentYear - periodoAnos + 1

  const datosPeriodo = euriborData.filter(d => d.year >= startYear && d.year <= currentYear)
  
  if (datosPeriodo.length === 0) {
    return { min: 0, max: 0 }
  }
  
  const valores = datosPeriodo.map(d => d.value)
  return {
    min: Math.min(...valores),
    max: Math.max(...valores)
  }
}

export const calcularInteresVariable = (euribor: number, diferencial: number): number => {
  return euribor + diferencial
}

export const crearTablaEscenarios = (
  diferencial: number, 
  periodoAnalisis: number = 10,
  lang: Language = 'es'
) => {
  const euriborActual = getEuriborActual()
  const euriborHistorico = getEuriborHistorico(periodoAnalisis)
  // El histórico usa medias anuales y el actual es la última media mensual:
  // el rango mostrado debe contener siempre el valor actual
  const euriborMin = Math.min(euriborHistorico.min, euriborActual)
  const euriborMax = Math.max(euriborHistorico.max, euriborActual)

  return [
    {
      escenario: t('mortgage.form.scenarios.historicalMinimum', lang),
      euribor: euriborMin,
      interesTotal: calcularInteresVariable(euriborMin, diferencial)
    },
    {
      escenario: t('mortgage.form.scenarios.current', lang),
      euribor: euriborActual,
      interesTotal: calcularInteresVariable(euriborActual, diferencial)
    },
    {
      escenario: t('mortgage.form.scenarios.historicalMaximum', lang),
      euribor: euriborMax,
      interesTotal: calcularInteresVariable(euriborMax, diferencial)
    }
  ]
}
