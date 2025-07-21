export const COMUNIDADES = [
  {
    nombre: "Andalucía",
    ITP: 7.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 250000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 250.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 250000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 250.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 15,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 30000,
        },
        descripcion:
          "15% de bonificación para jóvenes hasta 35 años con ingresos <30.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 30000 },
  },
  {
    nombre: "Aragón",
    ITP: 8.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Asturias",
    ITP: 8.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Baleares",
    ITP: 8.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: false,
      zonaDespoblada: false,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Canarias",
    ITP: 6.5,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 250000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 250.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 250000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 250.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 3.5,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 15,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 30000,
        },
        descripcion:
          "15% de bonificación para jóvenes hasta 35 años con ingresos <30.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: false,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 30000 },
  },
  {
    nombre: "Cantabria",
    ITP: 8.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Castilla y León",
    ITP: 8.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Castilla-La Mancha",
    ITP: 8.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: false,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Cataluña",
    ITP: 10.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: false,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Comunidad Valenciana",
    ITP: 10.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: false,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Extremadura",
    ITP: 8.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: true,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Galicia",
    ITP: 10.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: false,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Madrid",
    ITP: 6.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: false,
      zonaDespoblada: false,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Murcia",
    ITP: 8.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: false,
      zonaDespoblada: false,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Navarra",
    ITP: 6.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: false,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "País Vasco",
    ITP: 7.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: false,
      zonaDespoblada: true,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "La Rioja",
    ITP: 7.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: true,
      situacionFamiliar: true,
      discapacidad: true,
      victimas: false,
      zonaDespoblada: false,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Ceuta",
    ITP: 6.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: false,
      situacionFamiliar: true,
      discapacidad: false,
      victimas: false,
      zonaDespoblada: false,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
  {
    nombre: "Melilla",
    ITP: 6.0,
    reducciones: [
      {
        tipo: 6,
        condiciones: { viviendaHabitual: true, valorMaximo: 150000 },
        descripcion: "Vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          edadMaxima: 35,
        },
        descripcion: "Jóvenes hasta 35 años, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereDiscapacidad: 33,
        },
        descripcion:
          "Personas con discapacidad ≥33%, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 200000,
          requiereFamiliaNumerosa: true,
        },
        descripcion: "Familias numerosas, vivienda habitual hasta 200.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaViolencia: true,
        },
        descripcion:
          "Víctimas de violencia de género, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereVictimaTerrorismo: true,
        },
        descripcion: "Víctimas de terrorismo, vivienda habitual hasta 150.000€",
      },
      {
        tipo: 4,
        condiciones: {
          viviendaHabitual: true,
          valorMaximo: 150000,
          requiereZonaDespoblada: true,
        },
        descripcion: "Zonas despobladas, vivienda habitual hasta 150.000€",
      },
    ],
    bonificaciones: [
      {
        nombre: "Bonificación jóvenes",
        porcentaje: 20,
        condiciones: {
          viviendaHabitual: true,
          edadMaxima: 35,
          ingresosMaximos: 35000,
        },
        descripcion:
          "20% de bonificación para jóvenes hasta 35 años con ingresos <35.000€",
      },
    ],
    camposDinamicos: {
      ingresos: false,
      situacionFamiliar: true,
      discapacidad: false,
      victimas: false,
      zonaDespoblada: false,
    },
    limites: { edadMaxima: 35, ingresosMaximos: 35000 },
  },
]
