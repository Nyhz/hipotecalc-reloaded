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

// Cuota mensual por el sistema de amortización francés. Guardas numéricas:
// un plazo 0 dividiría por cero, y un tipo 0 es válido (capital / meses).
export function isValidLoanTerm(value: string): boolean {
  const years = Number(value)
  return value.trim() !== '' && Number.isInteger(years) && years >= 1 && years <= 40
}

export function cuotaFrancesa(capital: number, tinAnual: number, anos: number): number {
  const numPagos = anos * 12
  if (!capital || capital <= 0 || numPagos <= 0 || !Number.isFinite(tinAnual)) return 0

  const i = tinAnual / 100 / 12
  if (i === 0) return capital / numPagos

  const cuota = (capital * (i * Math.pow(1 + i, numPagos))) / (Math.pow(1 + i, numPagos) - 1)
  return Math.round(cuota * 100) / 100
}

// Inversa de la cuota francesa: capital máximo que se amortiza con una cuota
// dada. Base de la regla del 35 % de endeudamiento.
export function capitalDesdeCuota(cuota: number, tinAnual: number, anos: number): number {
  const numPagos = anos * 12
  if (!cuota || cuota <= 0 || numPagos <= 0 || !Number.isFinite(tinAnual)) return 0

  const i = tinAnual / 100 / 12
  if (i === 0) return Math.round(cuota * numPagos * 100) / 100

  const capital = (cuota * (1 - Math.pow(1 + i, -numPagos))) / i
  return Math.round(capital * 100) / 100
}

export function cuotaMensual(params: MortgageParams): number {
  const { cantidadHipoteca, tin, plazo } = params
  return cuotaFrancesa(cantidadHipoteca, tin, Number(plazo))
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
