interface ITPBracket {
  min: number
  max: number | null
  rate: number
}

interface SpecialRates {
  reducedRate?: number
  youngBuyer?: number
  largeFamily?: number
  disability?: number
  genderViolence?: number
  ruralDepopulation?: number
  monoparental?: number
  firstHome?: number
  vpo?: number
}

interface CamposDinamicos {
  tipoReducido?: boolean
  ingresos?: boolean
  situacionFamiliar?: boolean
  discapacidad?: boolean
  victimas?: boolean
  zonaDespoblada?: boolean
  edad?: boolean
  primeraVivienda?: boolean
  familiaNumerosa?: boolean
  monoparental?: boolean
  vpo?: boolean
  hipoteca?: boolean
  tasacion?: boolean
  patrimonio?: boolean
  residencia?: boolean
  ventaAnterior?: boolean
}

interface Comunidad {
  nombre: string
  ITP: number
  itpBrackets?: ITPBracket[]
  specialRates?: SpecialRates
  hasRuralDepopulationZones?: boolean
  camposDinamicos?: CamposDinamicos
  bonificaciones?: {
    porcentaje?: number
    condiciones?: string[]
  }
}

export const COMUNIDADES: Comunidad[] = [
  {
    nombre: "Andalucía",
    ITP: 7.0,
    itpBrackets: [
      { min: 0, max: 150000, rate: 6.0 },
      { min: 150000, max: null, rate: 7.0 }
    ],
    specialRates: {
      youngBuyer: 3.5,
      largeFamily: 3.5,
      disability: 3.5,
      genderViolence: 3.5,
      ruralDepopulation: 3.5
    },
    hasRuralDepopulationZones: true,
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: true,
      primeraVivienda: true,
      familiaNumerosa: true
    }
  },
  {
    nombre: "Aragón",
    ITP: 8.0,
    itpBrackets: [
      { min: 0, max: 400000, rate: 8.0 },
      { min: 400000, max: 450000, rate: 8.5 },
      { min: 450000, max: 500000, rate: 9.0 },
      { min: 500000, max: 750000, rate: 9.5 },
      { min: 750000, max: null, rate: 10.0 }
    ],
    specialRates: {
      youngBuyer: 8.0, // Bonificación del 12.5%
      largeFamily: 8.0, // Bonificación del 50%
      disability: 8.0, // Bonificación del 12.5%
      genderViolence: 8.0, // Bonificación del 12.5%
      ruralDepopulation: 8.0 // Bonificación del 60%
    },
    hasRuralDepopulationZones: true,
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      ingresos: true,
      hipoteca: true,
      tasacion: true
    },
    bonificaciones: {
      porcentaje: 12.5,
      condiciones: ["menor de 35 años", "discapacidad ≥65%", "víctima violencia de género"]
    }
  },
  {
    nombre: "Asturias",
    ITP: 8.0,
    itpBrackets: [
      { min: 0, max: 300000, rate: 8.0 },
      { min: 300000, max: 500000, rate: 9.0 },
      { min: 500000, max: null, rate: 10.0 }
    ],
    specialRates: {
      youngBuyer: 4.0,
      largeFamily: 4.0,
      genderViolence: 4.0,
      ruralDepopulation: 4.0,
      vpo: 3.0
    },
    hasRuralDepopulationZones: true,
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      vpo: true
    }
  },
  {
    nombre: "Baleares",
    ITP: 8.0,
    itpBrackets: [
      { min: 0, max: 400000, rate: 8.0 },
      { min: 400000, max: 600000, rate: 9.0 },
      { min: 600000, max: 1000000, rate: 10.0 },
      { min: 1000000, max: 3000000, rate: 12.0 },
      { min: 3000000, max: null, rate: 13.0 }
    ],
    specialRates: {
      firstHome: 4.0,
      youngBuyer: 2.0,
      largeFamily: 2.0,
      monoparental: 2.0,
      disability: 0.0 // 100% bonificación
    },
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      monoparental: true,
      ingresos: true,
      residencia: true,
      hipoteca: true
    }
  },
  {
    nombre: "Canarias",
    ITP: 6.5,
    specialRates: {
      firstHome: 5.0,
      largeFamily: 1.0,
      monoparental: 1.0,
      disability: 1.0,
      youngBuyer: 5.0, // Con bonificación del 20%
      genderViolence: 5.0 // Con bonificación del 20%
    },
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      victimas: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      monoparental: true,
      ventaAnterior: true,
      ingresos: true,
      vpo: true
    }
  },
  {
    nombre: "Cantabria",
    ITP: 9.0,
    itpBrackets: [
      { min: 0, max: 200000, rate: 7.0 },
      { min: 200000, max: null, rate: 9.0 }
    ],
    specialRates: {
      youngBuyer: 4.0,
      largeFamily: 4.0,
      monoparental: 4.0,
      disability: 3.0,
      vpo: 4.0,
      ruralDepopulation: 4.0
    },
    hasRuralDepopulationZones: true,
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      monoparental: true,
      vpo: true,
      zonaDespoblada: true
    }
  },
  {
    nombre: "Castilla-La Mancha",
    ITP: 9.0,
    specialRates: {
      firstHome: 6.0,
      youngBuyer: 5.0,
      largeFamily: 5.0,
      monoparental: 5.0,
      disability: 5.0,
      ruralDepopulation: 5.0
    },
    hasRuralDepopulationZones: true,
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      monoparental: true,
      hipoteca: true,
      tasacion: true,
      zonaDespoblada: true
    }
  },
  {
    nombre: "Castilla y León",
    ITP: 8.0,
    specialRates: {
      youngBuyer: 0.01, // Tipo "cero" para jóvenes en medio rural
      largeFamily: 4.0,
      disability: 4.0,
      vpo: 4.0
    },
    hasRuralDepopulationZones: true,
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      vpo: true,
      zonaDespoblada: true
    }
  },
  {
    nombre: "Cataluña",
    ITP: 10.0,
    itpBrackets: [
      { min: 0, max: 600000, rate: 10.0 },
      { min: 600000, max: 900000, rate: 11.0 },
      { min: 900000, max: 1500000, rate: 12.0 },
      { min: 1500000, max: null, rate: 13.0 }
    ],
    specialRates: {
      largeFamily: 5.0,
      monoparental: 5.0,
      disability: 5.0,
      youngBuyer: 5.0,
      genderViolence: 5.0,
      vpo: 7.0
    },
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      victimas: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      monoparental: true,
      ingresos: true,
      vpo: true
    }
  },
  {
    nombre: "Comunidad Valenciana",
    ITP: 10.0,
    itpBrackets: [
      { min: 0, max: 400000, rate: 10.0 },
      { min: 400000, max: 600000, rate: 11.0 },
      { min: 600000, max: null, rate: 12.0 }
    ],
    specialRates: {
      youngBuyer: 7.0,
      largeFamily: 7.0,
      disability: 7.0,
      genderViolence: 7.0
    },
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      victimas: true,
      primeraVivienda: true,
      familiaNumerosa: true
    }
  },
  {
    nombre: "Extremadura",
    ITP: 8.0,
    itpBrackets: [
      { min: 0, max: 200000, rate: 8.0 },
      { min: 200000, max: null, rate: 9.0 }
    ],
    specialRates: {
      firstHome: 7.0,
      youngBuyer: 6.0,
      largeFamily: 6.0,
      monoparental: 6.0,
      disability: 6.0
    },
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      monoparental: true,
      ingresos: true
    }
  },
  {
    nombre: "Galicia",
    ITP: 8.0,
    specialRates: {
      firstHome: 7.0,
      youngBuyer: 3.0,
      largeFamily: 3.0,
      genderViolence: 3.0,
      disability: 3.0,
      ruralDepopulation: 0.0 // Exento en zonas rurales
    },
    hasRuralDepopulationZones: true,
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      victimas: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      patrimonio: true,
      zonaDespoblada: true
    }
  },
  {
    nombre: "Madrid",
    ITP: 6.0,
    specialRates: {
      largeFamily: 4.0, // Tipo reducido para familia numerosa
      youngBuyer: 0.0, // 100% bonificación en municipios <2.500 hab
      firstHome: 5.4 // Bonificación 10% sobre cuota (6% * 0.9 = 5.4%)
    },
    hasRuralDepopulationZones: true,
    camposDinamicos: {
      edad: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      ventaAnterior: true,
      zonaDespoblada: true,
      situacionFamiliar: true,
      ingresos: false // Madrid no tiene límites de renta
    },
    bonificaciones: {
      porcentaje: 10, // Bonificación general del 10% para vivienda habitual ≤250.000€
      condiciones: [
        "Vivienda habitual",
        "Valor ≤ 250.000€",
        "Persona física",
        "No compatible con familia numerosa"
      ]
    }
  },
  {
    nombre: "Murcia",
    ITP: 8.0,
    specialRates: {
      vpo: 4.0,
      largeFamily: 3.0,
      youngBuyer: 3.0
    },
    camposDinamicos: {
      edad: true,
      primeraVivienda: true,
      familiaNumerosa: true,
      vpo: true
    }
  },
  {
    nombre: "Navarra",
    ITP: 6.0,
    specialRates: {
      largeFamily: 5.0
    },
    camposDinamicos: {
      primeraVivienda: true,
      familiaNumerosa: true
    }
  },
  {
    // El ITP foral se liquida sobre el Valor Mínimo Atribuible (VMA), no
    // sobre el precio de compraventa. Tipo general de vivienda: 4%.
    // Tipo reducido 2,5%: vivienda habitual con superficie <= 120 m2.
    nombre: "País Vasco",
    ITP: 4.0,
    specialRates: {
      reducedRate: 2.5,
      largeFamily: 2.5,
      monoparental: 2.5,
      disability: 2.5
    },
    camposDinamicos: {
      tipoReducido: true,
      familiaNumerosa: true,
      monoparental: true,
      discapacidad: true
    }
  },
  {
    nombre: "La Rioja",
    ITP: 7.0,
    itpBrackets: [
      { min: 0, max: 400000, rate: 7.0 },
      { min: 400000, max: 600000, rate: 8.0 },
      { min: 600000, max: null, rate: 9.0 }
    ],
    specialRates: {
      youngBuyer: 4.0,
      largeFamily: 5.0,
      disability: 5.0,
      genderViolence: 5.0
    },
    hasRuralDepopulationZones: true,
    camposDinamicos: {
      edad: true,
      discapacidad: true,
      victimas: true,
      primeraVivienda: true,
      familiaNumerosa: true
    }
  },
  {
    nombre: "Ceuta",
    ITP: 6.0,
    bonificaciones: {
      porcentaje: 50
    },
    camposDinamicos: {
      primeraVivienda: true
    }
  },
  {
    nombre: "Melilla",
    ITP: 6.0,
    bonificaciones: {
      porcentaje: 50
    },
    camposDinamicos: {
      primeraVivienda: true
    }
  }
]
