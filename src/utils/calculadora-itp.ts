import { COMUNIDADES } from "../constants/comunidades"
import { calcularITP, calcularIVA } from "./common-calculators"
import { t, type Language } from "../utils/i18n"

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
  tipoReducido?: boolean
  // Campos adicionales para casos específicos
  ingresos?: number
  hipoteca?: number
  tasacion?: number
  patrimonio?: number
  residencia?: number
  ventaAnterior?: boolean
  vpo?: boolean
  lang?: Language
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
  const lang = params.lang || 'es'
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
  // edad > 0: una edad en blanco (coaccionada a 0) no debe activar beneficios de joven
  if (edad > 0 && edad <= 35 && zonaDespoblada && primeraVivienda && precio <= 250000) {
    return {
      itp: 0,
      tipoAplicado: 0,
      descripcion: t('mortgage.form.itpModal.descriptions.madridYoungExemption', lang),
    }
  }

  // Paso 4: Comprobación de tipo reducido 4% por familia numerosa
  if (situacion.includes("familia-numerosa") && primeraVivienda) {
    // El 4% exige haber vendido la vivienda anterior (declaración expresa)
    if (ventaAnterior === true) {
      return {
        itp: calcularITP(precio, 4),
        tipoAplicado: 4,
        descripcion: t('mortgage.form.itpModal.descriptions.madridLargeFamilyReduced', lang),
      }
    } else {
      // Si no se especifica venta anterior, aplicar tipo general
      return {
        itp: calcularITP(precio, 6),
        tipoAplicado: 6,
        descripcion: t('mortgage.form.itpModal.descriptions.madridLargeFamilyGeneral', lang),
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
      descripcion: t('mortgage.form.itpModal.descriptions.madridFirstHomeDiscount', lang),
    }
  }

  // Paso 6: Caso general sin beneficios
  return {
    itp: calcularITP(precio, 6),
    tipoAplicado: 6,
    descripcion: t('mortgage.form.itpModal.descriptions.generalRate', lang).replace('{rate}', '6'),
  }
}

// Función principal para calcular ITP avanzado
export function calcularITPAvanzado(params: ITPParams): ITPResult {
  const { precio, tipoVivienda, comunidad: nombreComunidad } = params
  const lang = params.lang || 'es'

  if (!precio || precio <= 0) {
    return { itp: 0, tipoAplicado: 0, descripcion: t('mortgage.form.itpModal.descriptions.invalidPrice', lang) }
  }

  // Si es obra nueva, aplicar IVA
  if (tipoVivienda === "Obra nueva") {
    const iva = calcularIVA(precio, 10)
    return {
      itp: iva,
      tipoAplicado: 10,
      descripcion: t('mortgage.form.itpModal.vat10Description', lang),
    }
  }

  // Buscar la comunidad
  const comunidad = COMUNIDADES.find((c) => c.nombre === nombreComunidad)
  if (!comunidad) {
    const itpBasico = calcularITP(precio, 6)
    return {
      itp: itpBasico,
      tipoAplicado: 6,
      descripcion: t('mortgage.form.itpModal.descriptions.unspecifiedCommunity', lang).replace('{rate}', '6'),
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
      descripcion: t('mortgage.form.itpModal.descriptions.ceutaMelillaDiscount', lang)
        .replace('{rate}', String(comunidad.ITP))
        .replace('{community}', nombreComunidad),
    }
  }

  // Determinar el tipo aplicable según las condiciones
  let tipoAplicado = comunidad.ITP
  let descripcion = t('mortgage.form.itpModal.descriptions.generalRate', lang).replace('{rate}', String(comunidad.ITP))

  // Una edad en blanco llega coaccionada a 0 y no debe activar tipos de joven
  const edadValida = params.edad > 0

  // Recopilar todos los tipos reducidos aplicables y quedarse con el más
  // beneficioso (antes se sobreescribían en orden fijo, pudiendo sustituir
  // un tipo mejor por otro peor)
  let tipoReducidoAplicado = false
  if (comunidad.specialRates) {
    const { specialRates } = comunidad
    const candidatos: { tipo: number; descripcion: string }[] = []

    // Tipo reducido autonómico (p. ej. País Vasco: vivienda habitual <= 120 m2)
    if (params.tipoReducido && specialRates.reducedRate !== undefined) {
      candidatos.push({
        tipo: specialRates.reducedRate,
        descripcion: t('mortgage.form.itpModal.descriptions.reducedRate', lang).replace('{rate}', String(specialRates.reducedRate)),
      })
    }

    // Jóvenes
    if (edadValida && params.edad <= 35 && specialRates.youngBuyer !== undefined) {
      if (nombreComunidad === "Castilla y León") {
        // El tipo 0,01% de CyL es exclusivo del medio rural con precio <= 150.000€;
        // los jóvenes en zona urbana tributan al tipo general
        if (params.zonaDespoblada && precio <= 150000) {
          candidatos.push({
            tipo: 0.01,
            descripcion: t('mortgage.form.itpModal.descriptions.castillaLeonYoungRural', lang),
          })
        }
      } else {
        candidatos.push({
          tipo: specialRates.youngBuyer,
          descripcion: t('mortgage.form.itpModal.descriptions.youngBuyer', lang).replace('{rate}', String(specialRates.youngBuyer)),
        })
      }
    }

    // Familias numerosas
    if (
      params.situacion.includes("familia-numerosa") &&
      specialRates.largeFamily !== undefined
    ) {
      candidatos.push({
        tipo: specialRates.largeFamily,
        descripcion: t('mortgage.form.itpModal.descriptions.largeFamily', lang).replace('{rate}', String(specialRates.largeFamily)),
      })
    }

    // Familias monoparentales
    if (
      params.situacion === "familia-monoparental" &&
      specialRates.monoparental !== undefined
    ) {
      candidatos.push({
        tipo: specialRates.monoparental,
        descripcion: t('mortgage.form.itpModal.descriptions.monoparental', lang).replace('{rate}', String(specialRates.monoparental)),
      })
    }

    // Personas con discapacidad
    if (
      params.discapacidad &&
      params.porcentajeDiscapacidad >= 65 &&
      specialRates.disability !== undefined
    ) {
      candidatos.push({
        tipo: specialRates.disability,
        descripcion: t('mortgage.form.itpModal.descriptions.disability', lang).replace('{rate}', String(specialRates.disability)),
      })
    }

    // Víctimas de violencia de género
    if (params.victimaViolencia && specialRates.genderViolence !== undefined) {
      candidatos.push({
        tipo: specialRates.genderViolence,
        descripcion: t('mortgage.form.itpModal.descriptions.genderViolence', lang).replace('{rate}', String(specialRates.genderViolence)),
      })
    }

    // Zonas despobladas
    if (params.zonaDespoblada && specialRates.ruralDepopulation !== undefined) {
      if (nombreComunidad === "Galicia") {
        candidatos.push({
          tipo: 0, // Exento en zonas rurales de Galicia
          descripcion: t('mortgage.form.itpModal.descriptions.galiciaRural', lang),
        })
      } else {
        candidatos.push({
          tipo: specialRates.ruralDepopulation,
          descripcion: t('mortgage.form.itpModal.descriptions.ruralDepopulation', lang).replace('{rate}', String(specialRates.ruralDepopulation)),
        })
      }
    }

    // Primera vivienda
    if (params.primeraVivienda && specialRates.firstHome !== undefined) {
      candidatos.push({
        tipo: specialRates.firstHome,
        descripcion: t('mortgage.form.itpModal.descriptions.firstHome', lang).replace('{rate}', String(specialRates.firstHome)),
      })
    }

    // VPO
    if (params.vpo && specialRates.vpo !== undefined) {
      candidatos.push({
        tipo: specialRates.vpo,
        descripcion: t('mortgage.form.itpModal.descriptions.vpo', lang).replace('{rate}', String(specialRates.vpo)),
      })
    }

    if (candidatos.length > 0) {
      const mejor = candidatos.reduce((a, b) => (b.tipo < a.tipo ? b : a))
      if (mejor.tipo < tipoAplicado) {
        tipoAplicado = mejor.tipo
        descripcion = mejor.descripcion
        tipoReducidoAplicado = true
      }
    }
  }

  // Calcular ITP final
  let itpFinal: number

  if (tipoReducidoAplicado) {
    // Los tipos reducidos son tipos fijos: no se combinan con la escala progresiva
    itpFinal = calcularITP(precio, tipoAplicado)
  } else if (comunidad.itpBrackets && comunidad.itpBrackets.length > 0) {
    // Escala progresiva por tramos; exponer el tipo efectivo para que la
    // etiqueta mostrada coincida con el importe calculado
    itpFinal = calcularITPPorTramos(precio, comunidad.itpBrackets)
    tipoAplicado = Math.round((itpFinal / precio) * 10000) / 100
    descripcion = t('mortgage.form.itpModal.descriptions.generalRate', lang).replace('{rate}', String(tipoAplicado))
  } else {
    itpFinal = calcularITP(precio, tipoAplicado)
  }

  // Bonificaciones adicionales: solo si el comprador cumple alguna de las
  // condiciones (Aragón: <35 años, discapacidad >=65% o víctima de violencia
  // de género; antes se aplicaba a todos los compradores)
  if (comunidad.bonificaciones && comunidad.bonificaciones.porcentaje) {
    const cumpleCondiciones =
      !comunidad.bonificaciones.condiciones ||
      nombreComunidad !== "Aragón" ||
      (edadValida && params.edad < 35) ||
      (params.discapacidad && params.porcentajeDiscapacidad >= 65) ||
      params.victimaViolencia
    if (cumpleCondiciones) {
      const bonificacion = itpFinal * (comunidad.bonificaciones.porcentaje / 100)
      itpFinal -= bonificacion
      descripcion += ' ' + t('mortgage.form.itpModal.descriptions.additionalDiscount', lang).replace('{percentage}', String(comunidad.bonificaciones.porcentaje))
    }
  }

  return {
    itp: Math.round(itpFinal * 100) / 100,
    tipoAplicado,
    descripcion,
  }
}
