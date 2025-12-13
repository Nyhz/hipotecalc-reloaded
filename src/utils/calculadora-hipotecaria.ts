// Import shared functions
import { calcularITP, calcularIVA } from "./common-calculators"

// Re-export shared functions
export { calcularITP, calcularIVA }

// Re-export ITP advanced function
export { calcularITPAvanzado } from "./calculadora-itp"

// Import Euribor data
import { euriborData } from "../constants/euribor-values"

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

  if (!cantidadHipoteca || !tin || !plazo) return 0

  const tinMensual = tin / 100 / 12
  const numPagos = Number(plazo) * 12

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

  if (!cantidadHipoteca || !tin || !plazo) return 0

  const cuota = cuotaMensual(params)
  const numPagos = Number(plazo) * 12
  const totalPagado = cuota * numPagos
  const interes = totalPagado - cantidadHipoteca

  return Math.round(interes * 100) / 100
}

export function importeTotal(params: MortgageParams): number {
  const { cantidadHipoteca, tin, plazo } = params

  if (!cantidadHipoteca || !tin || !plazo) return 0

  const cuota = cuotaMensual(params)
  const numPagos = Number(plazo) * 12
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
  // Obtener el valor más reciente del Euribor
  const sortedData = [...euriborData].sort((a, b) => b.year - a.year)
  return sortedData[0].value
}

export const getEuriborHistorico = (periodoAnos: number): { min: number; max: number } => {
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - periodoAnos
  
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
  
  return [
    {
      escenario: t('mortgage.form.scenarios.historicalMinimum', lang),
      euribor: euriborHistorico.min,
      interesTotal: calcularInteresVariable(euriborHistorico.min, diferencial)
    },
    {
      escenario: t('mortgage.form.scenarios.current', lang),
      euribor: euriborActual,
      interesTotal: calcularInteresVariable(euriborActual, diferencial)
    },
    {
      escenario: t('mortgage.form.scenarios.historicalMaximum', lang),
      euribor: euriborHistorico.max,
      interesTotal: calcularInteresVariable(euriborHistorico.max, diferencial)
    }
  ]
}
