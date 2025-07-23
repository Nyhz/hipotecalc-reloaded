import { COMUNIDADES } from "../constants/comunidades"
import { calcularITP, calcularIVA } from "./common-calculators"

interface ITPParams {
  precio: number
  tipoVivienda: string
  comunidad: string
  edad: number
  discapacidad: boolean
  porcentajeDiscapacidad: number
  situacion: string
  numHijos: number
  victimaViolencia: boolean
  victimaTerrorismo: boolean
  zonaDespoblada: boolean
  primeraVivienda: boolean
  // Campos adicionales para casos específicos
  ingresos?: number
  hipoteca?: number
  tasacion?: number
  patrimonio?: number
  residencia?: number
  ventaAnterior?: boolean
  vpo?: boolean
}

interface ITPResult {
  itp: number
  tipoAplicado: number
  descripcion: string
}

// Función para calcular ITP por tramos (escala progresiva)
function calcularITPPorTramos(precio: number, brackets: any[]): number {
  let itpTotal = 0
  let precioRestante = precio

  for (const bracket of brackets) {
    if (precioRestante <= 0) break

    const baseImponible =
      bracket.max === null
        ? precioRestante
        : Math.min(precioRestante, bracket.max - bracket.min)

    if (baseImponible > 0) {
      itpTotal += (baseImponible * bracket.rate) / 100
      precioRestante -= baseImponible
    }
  }

  return Math.round(itpTotal * 100) / 100
}

// Función específica para calcular ITP en Madrid según el flujo de decisión detallado
function calcularITPMadrid(params: ITPParams): ITPResult {
  const {
    precio,
    edad,
    situacion,
    zonaDespoblada,
    primeraVivienda,
    ventaAnterior,
  } = params

  // Paso 1: Determinar la base imponible
  const baseImponible = precio

  // Paso 2: Verificar si es empresa inmobiliaria (no implementado en la UI actual)
  // Si fuera empresa inmobiliaria con fin de reventa, aplicar 2%
  // Por ahora asumimos persona física

  // Paso 3: Comprobación de bonificación joven 100% (<35 años en municipio <2.500 hab)
  if (edad <= 35 && zonaDespoblada && primeraVivienda && precio <= 250000) {
    return {
      itp: 0,
      tipoAplicado: 0,
      descripcion:
        "ITP 0% - Exención total para jóvenes <35 años en municipios <2.500 habitantes",
    }
  }

  // Paso 4: Comprobación de tipo reducido 4% por familia numerosa
  if (situacion.includes("familia-numerosa") && primeraVivienda) {
    // Verificar requisito de venta de vivienda anterior
    if (ventaAnterior !== undefined) {
      return {
        itp: calcularITP(precio, 4),
        tipoAplicado: 4,
        descripcion:
          "ITP 4% - Tipo reducido para familia numerosa (vivienda habitual)",
      }
    } else {
      // Si no se especifica venta anterior, aplicar tipo general
      return {
        itp: calcularITP(precio, 6),
        tipoAplicado: 6,
        descripcion:
          "ITP 6% - Tipo general (familia numerosa sin cumplir requisito de venta anterior)",
      }
    }
  }

  // Paso 5: Comprobación de bonificación 10% por vivienda habitual ≤250.000€
  if (primeraVivienda && precio <= 250000) {
    const itpBasico = calcularITP(precio, 6)
    const itpBonificado = itpBasico * 0.9 // Bonificación del 10%
    return {
      itp: itpBonificado,
      tipoAplicado: 5.4, // 6% * 0.9 = 5.4%
      descripcion:
        "ITP 5.4% - Bonificación del 10% sobre cuota (vivienda habitual ≤250.000€)",
    }
  }

  // Paso 6: Caso general sin beneficios
  return {
    itp: calcularITP(precio, 6),
    tipoAplicado: 6,
    descripcion: "ITP 6% - Tipo general",
  }
}

// Función principal para calcular ITP avanzado
export function calcularITPAvanzado(params: ITPParams): ITPResult {
  const { precio, tipoVivienda, comunidad: nombreComunidad } = params

  if (!precio || precio <= 0) {
    return { itp: 0, tipoAplicado: 0, descripcion: "Precio no válido" }
  }

  // Si es obra nueva, aplicar IVA
  if (tipoVivienda === "Obra nueva") {
    const iva = calcularIVA(precio, 10)
    return {
      itp: iva,
      tipoAplicado: 10,
      descripcion: "IVA 10% (obra nueva)",
    }
  }

  // Buscar la comunidad
  const comunidad = COMUNIDADES.find((c) => c.nombre === nombreComunidad)
  if (!comunidad) {
    const itpBasico = calcularITP(precio, 6)
    return {
      itp: itpBasico,
      tipoAplicado: 6,
      descripcion: "ITP 6% (comunidad no especificada)",
    }
  }

  // Lógica específica para Madrid con flujo de decisión detallado
  if (nombreComunidad === "Madrid") {
    return calcularITPMadrid(params)
  }

  // Aplicar bonificación especial para Ceuta y Melilla
  if (nombreComunidad === "Ceuta" || nombreComunidad === "Melilla") {
    const itpBasico = calcularITP(precio, comunidad.ITP)
    const itpBonificado = itpBasico * 0.5 // 50% de bonificación
    return {
      itp: itpBonificado,
      tipoAplicado: comunidad.ITP * 0.5,
      descripcion: `ITP ${comunidad.ITP}% con bonificación del 50% (${nombreComunidad})`,
    }
  }

  // Determinar el tipo aplicable según las condiciones
  let tipoAplicado = comunidad.ITP
  let descripcion = `ITP general ${comunidad.ITP}%`

  // Verificar tipos reducidos especiales
  if (comunidad.specialRates) {
    const { specialRates } = comunidad

    // Jóvenes
    if (params.edad <= 35 && specialRates.youngBuyer !== undefined) {
      if (
        nombreComunidad === "Castilla y León" &&
        params.zonaDespoblada &&
        precio <= 150000
      ) {
        tipoAplicado = 0.01 // Tipo "cero" para jóvenes en medio rural
        descripcion = "ITP 0.01% (jóvenes en medio rural, Castilla y León)"
      } else if (
        nombreComunidad === "Madrid" &&
        params.zonaDespoblada &&
        precio <= 250000
      ) {
        tipoAplicado = 0 // 100% bonificación
        descripcion = "ITP 0% (jóvenes en municipios <2.500 hab, Madrid)"
      } else {
        tipoAplicado = specialRates.youngBuyer
        descripcion = `ITP ${specialRates.youngBuyer}% (jóvenes ≤35 años)`
      }
    }

    // Familias numerosas
    if (
      params.situacion.includes("familia-numerosa") &&
      specialRates.largeFamily !== undefined
    ) {
      tipoAplicado = specialRates.largeFamily
      descripcion = `ITP ${specialRates.largeFamily}% (familia numerosa)`
    }

    // Personas con discapacidad
    if (
      params.discapacidad &&
      params.porcentajeDiscapacidad >= 65 &&
      specialRates.disability !== undefined
    ) {
      tipoAplicado = specialRates.disability
      descripcion = `ITP ${specialRates.disability}% (discapacidad ≥65%)`
    }

    // Víctimas de violencia de género
    if (params.victimaViolencia && specialRates.genderViolence !== undefined) {
      tipoAplicado = specialRates.genderViolence
      descripcion = `ITP ${specialRates.genderViolence}% (víctima violencia de género)`
    }

    // Zonas despobladas
    if (params.zonaDespoblada && specialRates.ruralDepopulation !== undefined) {
      if (nombreComunidad === "Galicia") {
        tipoAplicado = 0 // Exento en zonas rurales de Galicia
        descripcion = "ITP 0% (zona rural despoblada, Galicia)"
      } else {
        tipoAplicado = specialRates.ruralDepopulation
        descripcion = `ITP ${specialRates.ruralDepopulation}% (zona despoblada)`
      }
    }

    // Primera vivienda
    if (params.primeraVivienda && specialRates.firstHome !== undefined) {
      tipoAplicado = specialRates.firstHome
      descripcion = `ITP ${specialRates.firstHome}% (primera vivienda habitual)`
    }

    // VPO
    if (params.vpo && specialRates.vpo !== undefined) {
      tipoAplicado = specialRates.vpo
      descripcion = `ITP ${specialRates.vpo}% (vivienda de protección oficial)`
    }
  }

  // Calcular ITP final
  let itpFinal: number

  // Si hay brackets (escala progresiva), calcular por tramos
  if (comunidad.itpBrackets && comunidad.itpBrackets.length > 0) {
    itpFinal = calcularITPPorTramos(precio, comunidad.itpBrackets)
  } else {
    itpFinal = calcularITP(precio, tipoAplicado)
  }

  // Aplicar bonificaciones adicionales si existen
  if (comunidad.bonificaciones && comunidad.bonificaciones.porcentaje) {
    const bonificacion = itpFinal * (comunidad.bonificaciones.porcentaje / 100)
    itpFinal -= bonificacion
    descripcion += ` con bonificación del ${comunidad.bonificaciones.porcentaje}%`
  }

  return {
    itp: Math.round(itpFinal * 100) / 100,
    tipoAplicado,
    descripcion,
  }
}
