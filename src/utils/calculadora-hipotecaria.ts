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

export function calcularITP(precio: number, porcentaje: number = 6): number {
  if (!precio || precio <= 0) return 0
  return (((precio * porcentaje) / 100) * 100) / 100
}

export function calcularIVA(precio: number, porcentaje: number = 10): number {
  if (!precio || precio <= 0) return 0
  return (((precio * porcentaje) / 100) * 100) / 100
}

export function calcularTIN(tae: number): number {
  if (!tae || tae <= 0) return 0

  const taeDecimal = tae / 100
  const tinDecimal = (Math.pow(1 + taeDecimal, 1 / 12) - 1) * 12
  const tin = tinDecimal * 100

  return (tin * 100) / 100
}

export function calcularITPAvanzado({
  precio,
  tipoVivienda,
  comunidad,
  edad,
  discapacidad,
  porcentajeDiscapacidad,
  situacion,
  numHijos,
  victimaViolencia,
  victimaTerrorismo,
  zonaDespoblada,
  primeraVivienda,
}: {
  precio: number
  tipoVivienda: string
  comunidad: string
  edad?: number
  discapacidad?: boolean
  porcentajeDiscapacidad?: number
  situacion?: string
  numHijos?: number
  victimaViolencia?: boolean
  victimaTerrorismo?: boolean
  zonaDespoblada?: boolean
  primeraVivienda?: boolean
}) {
  const { COMUNIDADES } = require("../constants/comunidades")
  const comunidadObj = COMUNIDADES.find((c: any) => c.nombre === comunidad)
  if (!comunidadObj) return { itp: 0, tipoAplicado: 0, descripcion: "" }

  let tipoAplicado = comunidadObj.ITP
  let descripcion = ""
  if (comunidadObj.reducciones) {
    const reduccionesValidas = comunidadObj.reducciones.filter((red: any) => {
      const cond = red.condiciones || {}
      if (cond.viviendaHabitual && tipoVivienda === "Obra nueva") return false
      if (cond.valorMaximo && precio > cond.valorMaximo) return false
      if (cond.edadMaxima && (!edad || edad > cond.edadMaxima)) return false
      if (
        cond.requiereDiscapacidad &&
        (!discapacidad ||
          (porcentajeDiscapacidad || 0) < cond.requiereDiscapacidad)
      )
        return false
      if (
        cond.requiereFamiliaNumerosa &&
        ![
          "familia-numerosa-general",
          "familia-numerosa-especial",
          "familia-monoparental",
        ].includes(situacion || "")
      )
        return false
      if (cond.requiereVictimaViolencia && !victimaViolencia) return false
      if (cond.requiereVictimaTerrorismo && !victimaTerrorismo) return false
      if (cond.requiereZonaDespoblada && !zonaDespoblada) return false
      return true
    })
    if (reduccionesValidas.length > 0) {
      const mejor = reduccionesValidas.reduce((a: any, b: any) =>
        a.tipo < b.tipo ? a : b
      )
      tipoAplicado = mejor.tipo
      descripcion = mejor.descripcion
    }
  }
  const itp = Math.round(precio * (tipoAplicado / 100))
  return { itp, tipoAplicado, descripcion }
}
