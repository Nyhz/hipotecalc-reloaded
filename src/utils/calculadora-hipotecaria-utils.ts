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
