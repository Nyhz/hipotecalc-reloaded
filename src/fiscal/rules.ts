import type { Context, Requirement, Tariff, Tax, TaxRule } from "./types";
import { COVERAGE_FROM, REGIONS, source } from "./sources";
import { bands, flat, partial, quota } from "./tariffs";
import {
  age,
  all,
  any,
  cap,
  cents,
  deed,
  degree,
  family,
  first,
  habitual,
  income,
  known,
  noOther,
  numberTest,
  occupancy,
  protectedHome,
  requirement,
  rural,
  soldOrNone,
  text,
  yes,
} from "./requirements";

export const RULES: TaxRule[] = [];
function add(
  region: string,
  tax: Tax,
  id: string,
  title: string,
  en: string,
  tariff: TaxRule["tariff"],
  requirements: Requirement[],
  priority: number,
  article: string,
  from = COVERAGE_FROM,
  to?: string,
  override?: string,
) {
  RULES.push({
    id: `${region}-${tax.toLowerCase()}-${id}`,
    comunidad: region,
    impuesto: tax,
    title: text(title, en),
    tariff,
    requirements,
    priority,
    source: source(region, article, override),
    effectiveFrom: from,
    effectiveTo: to,
    category:
      priority === 0 ? "general" : priority >= 900 ? "surcharge" : "benefit",
    group: `${region}-${tax}-adquisicion`,
  });
}
const general: Record<string, { itp: Tariff; ajd: Tariff; article: string }> = {
  andalucia: { itp: flat(7), ajd: flat(1.2), article: "arts. 43 y 49–50" },
  aragon: {
    itp: bands("progressive", [
      [400000, 8],
      [450000, 8.5],
      [500000, 9],
      [750000, 9.5],
      [null, 10],
    ]),
    ajd: flat(1.5),
    article: "arts. 121-1 y 122-1",
  },
  asturias: {
    itp: bands("whole-value", [
      [300000, 8],
      [500000, 9],
      [null, 10],
    ]),
    ajd: flat(1.2),
    article: "arts. 26 y 34",
  },
  baleares: {
    itp: {
      ...bands("progressive", [
        [400000, 8],
        [600000, 9],
        [1000000, 10],
        [2000000, 12],
        [null, 13],
      ]),
      meanRounding: "balear",
    } as Tariff,
    ajd: bands("whole-value", [
      [999999.99, 1.5],
      [null, 2],
    ]),
    article: "arts. 10, 17 y 17 bis",
  },
  canarias: {
    itp: flat(6.5),
    ajd: flat(1),
    article: "DLeg. 1/2009, arts. 31 y 36 (adquisición sujeta a IGIC)",
  },
  cantabria: { itp: flat(9), ajd: flat(1.5), article: "arts. 9 y 13" },
  "castilla-la-mancha": {
    itp: flat(9),
    ajd: flat(1.5),
    article: "arts. 19 y 21",
  },
  "castilla-y-leon": {
    itp: bands("progressive", [
      [250000, 8],
      [null, 10],
    ]),
    ajd: flat(1.5),
    article: "arts. 24 y 26",
  },
  cataluna: {
    itp: bands("progressive", [
      [600000, 10],
      [900000, 11],
      [1500000, 12],
      [null, 13],
    ]),
    ajd: flat(1.5),
    article: "arts. 641-1 y 642-1",
  },
  extremadura: {
    itp: bands("progressive", [
      [360000, 8],
      [600000, 10],
      [null, 11],
    ]),
    ajd: flat(1.5),
    article: "arts. 36 y 46",
  },
  galicia: { itp: flat(8), ajd: flat(1.5), article: "arts. 14 y 15" },
  madrid: {
    itp: flat(6),
    ajd: bands("whole-value", [
      [120000, 0.4],
      [180000, 0.5],
      [null, 0.75],
    ]),
    article: "arts. 28 y 32",
  },
  murcia: {
    itp: flat(7.75),
    ajd: flat(1.5),
    article: "arts. 6 y 7.8 (primera transmisión de vivienda)",
  },
  navarra: { itp: flat(6), ajd: flat(0.5), article: "arts. 8 y 22" },
  "pais-vasco": {
    itp: flat(4),
    ajd: flat(0.5),
    article: "Normativa foral: transmisión de viviendas",
  },
  "la-rioja": { itp: flat(7), ajd: flat(1), article: "arts. 44 y 48" },
  ceuta: {
    itp: quota(flat(6), 50),
    ajd: quota(flat(0.5), 50),
    article: "arts. 11, 31 y 57 bis",
  },
  melilla: {
    itp: quota(flat(6), 50),
    ajd: quota(flat(0.5), 50),
    article: "arts. 11, 31 y 57 bis",
  },
};
for (const [r, row] of Object.entries(general)) {
  add(
    r,
    "ITP",
    "general",
    "Tarifa general de vivienda usada",
    "General resale-home tariff",
    row.itp,
    [],
    0,
    row.article,
    COVERAGE_FROM,
    undefined,
    r === "canarias" ? "BOC-j-2009-90008" : undefined,
  );
  add(
    r,
    "AJD",
    "general",
    "AJD de la escritura de adquisición",
    "AJD on the purchase deed",
    row.ajd,
    [],
    0,
    row.article,
    COVERAGE_FROM,
    undefined,
    r === "canarias" ? "BOC-j-2009-90008" : undefined,
  );
}
export const applicableRules = (region: string, tax: Tax, date: string) =>
  RULES.filter(
    (r) =>
      r.comunidad === region &&
      r.impuesto === tax &&
      r.effectiveFrom <= date &&
      (!r.effectiveTo || date <= r.effectiveTo),
  );
const protection = (kind: string) =>
  requirement(
    `proteccion-${kind}`,
    text(
      `Régimen certificado: ${kind}`,
      `Certified housing classification: ${kind}`,
    ),
    ["proteccion", "calificacionVigente"],
    (c) =>
      !c.input.proteccion || c.input.proteccion === "sin-clasificar"
        ? "unknown"
        : c.input.proteccion !== kind
          ? false
          : (c.input.calificacionVigente ?? "unknown"),
  );
const violence = yes(
  "violenciaAcreditada",
  "Violencia de género acreditada en los términos de la norma",
  "Gender-violence status evidenced as required by law",
);
const terrorism = yes(
  "terrorismoAcreditado",
  "Condición legal de víctima del terrorismo acreditada",
  "Certified statutory terrorism-victim status",
);
const group = (id: string, ...rs: Requirement[]) =>
  any(
    id,
    text(
      "Pertenece a uno de los colectivos previstos en la norma",
      "Belongs to one of the statutory qualifying groups",
    ),
    ...rs,
  );
const resident = [habitual, occupancy];

// Andalucía: the €150,000 concession is a whole-home eligibility ceiling, not a general band.
for (const tax of ["ITP", "AJD"] as const) {
  add(
    "andalucia",
    tax,
    "habitual",
    "Vivienda habitual hasta 150.000 €",
    "Main residence up to €150,000",
    flat(tax === "ITP" ? 6 : 1),
    [...resident, cap(150000)],
    10,
    "arts. 43.1.b y 50.1.a",
  );
  add(
    "andalucia",
    tax,
    "joven-victimas-rural",
    "Jóvenes, víctimas o municipio rural acreditado",
    "Young buyers, victims or officially eligible rural location",
    flat(tax === "ITP" ? 3.5 : 0.3),
    [
      ...resident,
      cap(150000),
      group("colectivo-andaluz", age(35), violence, terrorism, rural),
    ],
    20,
    "arts. 43.1.c y 50.1.b",
  );
  const disabledFamily = all(
    "discapacidad-nucleo",
    text(
      "Discapacidad del núcleo familiar legalmente computable",
      "Qualifying disability within the statutory family unit",
    ),
    numberTest(
      "gradoDiscapacidadFamiliar",
      "Discapacidad familiar reconocida ≥33 %",
      "Family member certified disability ≥33%",
      (n) => n >= 33 && n <= 100,
    ),
    yes(
      "nucleoFamiliarAcreditado",
      "Miembro del núcleo familiar según art. 3 y vivienda habitual de la persona con discapacidad",
      "Family member under art. 3; the home is also the disabled person’s main residence",
    ),
  );
  add(
    "andalucia",
    tax,
    "familia-discapacidad",
    "Familia numerosa o discapacidad del comprador/núcleo familiar",
    "Large family or qualifying buyer/family disability",
    flat(tax === "ITP" ? 3.5 : 0.1),
    [
      ...resident,
      cap(250000),
      group(
        "familia-o-discapacidad",
        family("numerosa"),
        degree(33),
        disabledFamily,
      ),
    ],
    30,
    "arts. 3, 43.1.d–e y 50.1.c–d",
  );
}

// Cantabria: both the basic main-home rate and personal relief stop at the statutory cap.
for (const [from, to, limit, years] of [
  ["2026-01-01", "2026-04-30", 300000, 36],
  ["2026-05-01", undefined, 300000, 40],
] as const) {
  for (const tax of ["ITP", "AJD"] as const) {
    const suffix = from.slice(5),
      excess = tax === "ITP" ? 9 : 1.5;
    add(
      "cantabria",
      tax,
      `habitual-${suffix}`,
      "Vivienda habitual: tarifa según fecha",
      "Main residence: date-dependent tariff",
      tax === "ITP" && from === "2026-01-01"
        ? bands("whole-value", [
            [199999.99, 7],
            [null, 9],
          ])
        : partial(limit, tax === "ITP" ? 7 : 1, excess),
      [...resident, deed],
      10,
      "arts. 9 y 13; Ley 5/2026",
      from,
      to,
    );
    add(
      "cantabria",
      tax,
      `colectivos-${suffix}`,
      "Tipo reducido hasta el límite legal; exceso general",
      "Relief up to the statutory cap; general rate on excess",
      partial(limit, tax === "ITP" ? 4 : 0.1, excess),
      [
        ...resident,
        deed,
        group(
          "colectivos-cantabria",
          age(years),
          family("numerosa"),
          family("monoparental"),
          degree(33),
          rural,
          protectedHome,
        ),
      ],
      20,
      "arts. 9 y 13; Ley 5/2026",
      from,
      to,
    );
    add(
      "cantabria",
      tax,
      `discapacidad65-${suffix}`,
      "Discapacidad ≥65 %: tipo especial limitado",
      "Disability ≥65%: capped special rate",
      partial(limit, tax === "ITP" ? 3 : 0.05, excess),
      [...resident, deed, degree(65)],
      30,
      "arts. 9 y 13.6 y 9",
      from,
      to,
    );
  }
}

// Castilla-La Mancha: mortgage funding must be STRICTLY more than half the value.
const mortgageCLM = requirement(
  "hipoteca-clm",
  text(
    "Préstamo hipotecario sobre el inmueble, por entidad de crédito, superior al 50 % de su valor",
    "Loan from a credit institution secured on this property, strictly above 50% of its value",
  ),
  ["hipoteca", "hipotecaSobreInmueble", "entidadCredito"],
  (c) => {
    if (
      c.input.hipotecaSobreInmueble === false ||
      c.input.entidadCredito === false
    )
      return false;
    if (
      !known(c.input.hipoteca) ||
      c.input.hipotecaSobreInmueble === undefined ||
      c.input.entidadCredito === undefined
    )
      return "unknown";
    return cents(c.input.hipoteca) * 2 > cents(c.valor);
  },
);
const valuationCLM = requirement(
  "valoracion-clm",
  text(
    "Declarado ≥ referencia; sin referencia, declarado ≥ tasación. Antes del 31/03/2026: además, valor ≥ tasación e hipoteca ≤ declarado",
    "Declared value ≥ reference; without a reference, declared value ≥ appraisal. Before 31/03/2026: also value ≥ appraisal and mortgage ≤ declared value",
  ),
  [
    "valorDeclarado",
    "referenciaExiste",
    "valorReferencia",
    "tasacion",
    "hipoteca",
  ],
  (c) => {
    const declared = c.input.valorDeclarado ?? c.input.precio;
    if (c.input.fecha < "2026-03-31") {
      if (
        !known(c.input.hipoteca) ||
        !known(c.input.tasacion) ||
        c.input.referenciaExiste === undefined
      )
        return "unknown";
      if (
        cents(c.input.hipoteca) > cents(declared) ||
        cents(c.valor) < cents(c.input.tasacion)
      )
        return false;
      if (c.input.referenciaExiste)
        return known(c.input.valorReferencia)
          ? cents(declared) >= cents(c.input.valorReferencia)
          : "unknown";
      return true;
    }
    if (c.input.referenciaExiste === undefined) return "unknown";
    const comparison = c.input.referenciaExiste
      ? c.input.valorReferencia
      : c.input.tasacion;
    return known(comparison) ? cents(declared) >= cents(comparison) : "unknown";
  },
);
const clmSource = "https://www.boe.es/ccaa/docm/2026/061/q10660-10683.pdf";
for (const [from, to, limit, youngRate] of [
  ["2026-01-01", "2026-03-30", 180000, 5],
  ["2026-03-31", undefined, 240000, 3],
] as const) {
  const basics = [
    ...resident,
    first,
    cap(limit),
    mortgageCLM,
    valuationCLM,
    deed,
  ];
  for (const tax of ["ITP", "AJD"] as const) {
    const suffix = from.slice(5);
    add(
      "castilla-la-mancha",
      tax,
      `primera-${suffix}`,
      "Primera vivienda habitual con financiación y valor acreditados",
      "First main home meeting funding and valuation requirements",
      flat(tax === "ITP" ? 6 : 0.75),
      basics,
      10,
      "arts. 19, 21 y 22; reforma Ley 1/2026",
      from,
      to,
      clmSource,
    );
    add(
      "castilla-la-mancha",
      tax,
      `joven-${suffix}`,
      "Menor de 36 años: primera vivienda habitual",
      "Under 36: first main residence",
      flat(tax === "ITP" ? youngRate : from === "2026-01-01" ? 0.5 : 0.25),
      [...basics, age(36)],
      40,
      "arts. 19, 21 y 22",
      from,
      to,
      clmSource,
    );
    add(
      "castilla-la-mancha",
      tax,
      `familias-discapacidad-${suffix}`,
      "Familias numerosas/monoparentales o discapacidad ≥65 %",
      "Large/single-parent families or disability ≥65%",
      flat(tax === "ITP" ? 5 : 0.5),
      [
        ...basics,
        group(
          "colectivo-clm",
          family("numerosa"),
          family("monoparental"),
          degree(65),
        ),
      ],
      20,
      "arts. 19, 21 y 22",
      from,
      to,
      clmSource,
    );
    for (const [zone, itp, ajd, priority] of [
      ["riesgo", 5, 0.5, 21],
      ["intensa", 4, 0.25, 41],
      ["extrema", 3, 0.15, 50],
    ] as const) {
      add(
        "castilla-la-mancha",
        tax,
        `rural-${zone}-${suffix}`,
        `Zona oficial de despoblación: ${zone}`,
        `Official depopulation zone: ${zone}`,
        flat(tax === "ITP" ? itp : ajd),
        [
          ...basics,
          rural,
          requirement(
            `zona-${zone}`,
            text(
              `Clasificación oficial: ${zone}`,
              `Official designation: ${zone}`,
            ),
            ["zona"],
            (c) => (c.input.zona ? c.input.zona === zone : "unknown"),
          ),
        ],
        priority,
        "arts. 19, 21 y 22; Ley 2/2021",
        from,
        to,
        clmSource,
      );
    }
  }
}

// Comunitat Valenciana: the €1m upper rate applies to ALL the value.
for (const [from, to, itp, ajd] of [
  ["2026-01-01", "2026-05-31", 10, 1.5],
  ["2026-06-01", undefined, 9, 1.4],
] as const) {
  add(
    "comunidad-valenciana",
    "ITP",
    `general-${from}`,
    "Tipo general según valor total",
    "General rate based on whole-property value",
    bands("whole-value", [
      [1000000, itp],
      [null, 11],
    ]),
    [],
    0,
    "art. 13.1; Ley 5/2025, art. 33",
    from,
    to,
  );
  add(
    "comunidad-valenciana",
    "AJD",
    `general-${from}`,
    "AJD general de adquisición",
    "General purchase AJD",
    flat(ajd),
    [],
    0,
    "art. 14; Ley 5/2025",
    from,
    to,
  );
}
add(
  "comunidad-valenciana",
  "AJD",
  "habitual",
  "Adquisición de vivienda habitual",
  "Purchase of a main residence",
  flat(0.1),
  resident,
  10,
  "art. 14.1",
);
const cvLow = (low: number, high: number) =>
  bands("whole-value", [
    [180000, low],
    [null, high],
  ]);
add(
  "comunidad-valenciana",
  "ITP",
  "joven",
  "Menor de 35 años, primera vivienda y renta limitada",
  "Under 35, first home and IRPF income limit",
  cvLow(6, 8),
  [...resident, first, age(35), income(30000, 47000), deed],
  20,
  "arts. 13.2–3 y 4.4",
);
add(
  "comunidad-valenciana",
  "ITP",
  "vpo-general",
  "VPO general: primera vivienda habitual",
  "General-regime VPO: first main home",
  cvLow(6, 8),
  [...resident, first, protection("general"), deed],
  20,
  "art. 13.2–3",
);
const cvFamilyIncome = requirement(
  "renta-familia-cv",
  text(
    "Base liquidable general + ahorro: 30.000/47.000 €; categoría especial 35.000/58.000 €",
    "General + savings taxable bases: €30,000/47,000; special family category €35,000/58,000",
  ),
  ["familia", "irpfModo", "renta"],
  (c) =>
    !c.input.familia
      ? "unknown"
      : income(
          c.input.familia.endsWith("especial") ? 35000 : 30000,
          c.input.familia.endsWith("especial") ? 58000 : 47000,
        ).check(c),
);
const cvDisabled = group(
  "discapacidad-cv",
  degree(65),
  all(
    "mental33-permanente",
    text(
      "Discapacidad intelectual/mental permanente ≥33 %",
      "Permanent intellectual/mental disability ≥33%",
    ),
    degree(33),
    yes(
      "discapacidadPermanente",
      "Discapacidad reconocida de forma permanente",
      "Permanently certified disability",
    ),
    requirement(
      "tipo-discapacidad",
      text("Tipo intelectual o mental", "Intellectual or mental disability"),
      ["tipoDiscapacidad"],
      (c) =>
        c.input.tipoDiscapacidad
          ? c.input.tipoDiscapacidad === "intelectual-mental"
          : "unknown",
    ),
  ),
);
for (const [id, reqs] of [
  [
    "familia",
    [
      group("familia-cv", family("numerosa"), family("monoparental")),
      cvFamilyIncome,
    ],
  ],
  ["discapacidad", [cvDisabled]],
  ["vpo-especial", [first, protection("especial")]],
  ["violencia", [violence, income(30000, 47000)]],
] as [string, Requirement[]][])
  add(
    "comunidad-valenciana",
    "ITP",
    id,
    `Tipo reducido: ${id}`,
    `Reduced rate: ${id}`,
    cvLow(3, 4),
    [...resident, deed, ...reqs],
    30,
    "art. 13.4–5 y art. 4.4",
  );

// Extremadura. The 7% and personal 4% limits were already changed in April 2025.
const extBounds = [...resident, cap(200000), income(30000, 55000)];
add(
  "extremadura",
  "ITP",
  "habitual",
  "Vivienda habitual dentro de límites de valor e IRPF",
  "Main home within property-value and IRPF limits",
  flat(7),
  extBounds,
  10,
  "art. 40; Ley 1/2025",
);
const extDisabled = group(
  "discapacidad-ext",
  degree(65),
  yes(
    "movilidadReducida",
    "Ayuda de tercera persona, movilidad reducida o curatela acreditadas conforme al art. 41",
    "Certified third-party assistance, reduced mobility or court-appointed support under art. 41",
  ),
);
add(
  "extremadura",
  "ITP",
  "colectivos",
  "Joven, familia o discapacidad con requisitos acreditados",
  "Qualifying young buyer, family or disability",
  flat(4),
  [
    ...extBounds,
    group(
      "colectivo-ext",
      age(36),
      family("numerosa"),
      all(
        "monoparental-ext",
        text(
          "Supuesto monoparental específico del artículo 41",
          "Specific single-parent circumstances under art. 41",
        ),
        requirement(
          "categoria-monoparental-ext",
          text("Unidad familiar monoparental", "Single-parent household"),
          ["familia"],
          (c) =>
            c.input.familia
              ? c.input.familia.startsWith("monoparental")
              : "unknown",
        ),
        yes(
          "monoparentalExtremadura",
          "Al menos dos hijos, sin anualidades por alimentos y con derecho al mínimo íntegro por descendientes; situación civil del art. 41",
          "At least two children, no entitlement to maintenance and full dependent allowance; art. 41 marital-status conditions",
        ),
      ),
      extDisabled,
    ),
  ],
  20,
  "arts. 40–41",
);
for (const [from, to, limit, individual, joint] of [
  ["2026-01-01", "2026-08-04", 180000, 19000, 24000],
  ["2026-08-05", undefined, 200000, 30000, 55000],
] as const) {
  const reqs = [...resident, cap(limit), income(individual, joint), rural];
  if (to)
    reqs.push(
      requirement(
        "renta-familiar-ext-antigua",
        text(
          "Renta familiar agregada ≤30.000 € +3.000 € por hijo conviviente",
          "Aggregate family income ≤€30,000 +€3,000 per cohabiting child",
        ),
        ["rentaFamiliar", "hijos"],
        (c) =>
          known(c.input.rentaFamiliar) && known(c.input.hijos)
            ? c.input.rentaFamiliar <= 30000 + 3000 * c.input.hijos
            : "unknown",
      ),
    );
  add(
    "extremadura",
    "ITP",
    `rural-${from}`,
    "Municipio o entidad local de menos de 3.000 habitantes",
    "Municipality or local entity below 3,000 inhabitants",
    flat(4),
    reqs,
    20,
    "art. 44 bis; Ley 2/2026",
    from,
    to,
  );
}
add(
  "extremadura",
  "ITP",
  "protegida-anterior",
  "Vivienda protegida con precio máximo legal (régimen anterior)",
  "Price-capped protected home (previous regime)",
  flat(4),
  [...resident, protection("precio-maximo")],
  20,
  "art. 39, redacción anterior a Ley 2/2026",
  COVERAGE_FROM,
  "2026-08-04",
);
add(
  "extremadura",
  "ITP",
  "protegida",
  "Vivienda protegida con precio máximo legal",
  "Protected home with a statutory maximum price",
  flat(4),
  [...extBounds, protection("precio-maximo")],
  20,
  "art. 39; Ley 2/2026",
  "2026-08-05",
);
add(
  "extremadura",
  "AJD",
  "habitual",
  "Vivienda habitual: AJD del 0,50 %",
  "Main home: 0.50% purchase AJD",
  flat(0.5),
  extBounds,
  10,
  "art. 47; Ley 2/2026",
  "2026-08-05",
);
add(
  "extremadura",
  "AJD",
  "protegida",
  "Protegida con precio máximo legal: AJD del 0,10 %",
  "Statutorily price-capped protected home: 0.10% AJD",
  flat(0.1),
  [...extBounds, protection("precio-maximo")],
  20,
  "art. 47 bis; Ley 2/2026",
  "2026-08-05",
);
const extOldIncome = [
  income(19000, 24000),
  requirement(
    "renta-familiar-ext-ajd-anterior",
    text(
      "Renta familiar agregada ≤30.000 € +3.000 € por hijo conviviente",
      "Aggregate household income ≤€30,000 +€3,000 per cohabiting child",
    ),
    ["rentaFamiliar", "hijos"],
    (c) =>
      known(c.input.rentaFamiliar) && known(c.input.hijos)
        ? cents(c.input.rentaFamiliar) <= cents(30000 + 3000 * c.input.hijos)
        : "unknown",
  ),
];
add(
  "extremadura",
  "AJD",
  "habitual-anterior",
  "Vivienda habitual: requisitos anteriores al 05/08/2026",
  "Main home: requirements before 05/08/2026",
  flat(0.75),
  [...resident, cap(122000), ...extOldIncome],
  10,
  "art. 47, redacción anterior",
  COVERAGE_FROM,
  "2026-08-04",
);
add(
  "extremadura",
  "AJD",
  "rural-anterior",
  "Vivienda habitual rural: régimen hasta 04/08/2026",
  "Rural main home: regime through 04/08/2026",
  flat(0.5),
  [...resident, cap(180000), ...extOldIncome, rural],
  20,
  "art. 50 bis, redacción anterior",
  COVERAGE_FROM,
  "2026-08-04",
);
const bankPaymentExt = yes(
  "pagoBancario",
  "Pago mediante tarjeta, transferencia, cheque nominativo o ingreso bancario; arras entre particulares en efectivo ≤3.000 € (art. 52.3)",
  "Payment by card, transfer, named cheque or bank deposit; cash deposits between private parties ≤€3,000 (art. 52.3)",
);
for (const rule of RULES.filter(
  (r) => r.comunidad === "extremadura" && r.priority > 0,
))
  rule.requirements.push(bankPaymentExt);

// Galicia: property value AND household assets; the large-family formula is different.
const galLimit = (c: Context) =>
  known(c.input.miembrosFamilia)
    ? 240000 + 30000 * Math.max(0, c.input.miembrosFamilia - 1)
    : undefined;
const galLargeLimit = (c: Context) =>
  known(c.input.miembrosFamilia) && known(c.input.miembrosMinimosNumerosa)
    ? 400000 +
      50000 *
        Math.max(0, c.input.miembrosFamilia - c.input.miembrosMinimosNumerosa)
    : undefined;
const galBounds = (large = false) =>
  requirement(
    large ? "limites-familia-numerosa-gal" : "limites-familia-gal",
    text(
      large
        ? "Valor y patrimonio familiar ≤400.000 € +50.000 € por miembro que exceda del mínimo legal de familia numerosa"
        : "Valor y patrimonio familiar ≤240.000 € +30.000 € por miembro que exceda del primero",
      large
        ? "Property value and household assets ≤€400,000 +€50,000 per member above the statutory large-family minimum"
        : "Property value and household assets ≤€240,000 +€30,000 per member after the first",
    ),
    large
      ? ["miembrosFamilia", "miembrosMinimosNumerosa", "patrimonio"]
      : ["miembrosFamilia", "patrimonio"],
    (c) => {
      const limit = large ? galLargeLimit(c) : galLimit(c);
      if (!known(limit) || !known(c.input.patrimonio)) return "unknown";
      return (
        cents(c.input.precio) <= cents(limit) &&
        cents(c.input.patrimonio) <= cents(limit)
      );
    },
  );
for (const tax of ["ITP", "AJD"] as const) {
  add(
    "galicia",
    tax,
    "habitual",
    "Vivienda habitual con límites de valor y patrimonio",
    "Main residence meeting value and household-asset limits",
    flat(tax === "ITP" ? 7 : 1),
    [...resident, galBounds(), deed],
    10,
    "arts. 14.2 y 15.2",
  );
  const cohorts: [string, Requirement[]][] = [
    ["joven", [age(36), galBounds()]],
    ["monoparental", [family("monoparental"), galBounds()]],
    ["numerosa", [family("numerosa"), galBounds(true)]],
    ["discapacidad", [degree(65)]],
    [
      "violencia",
      [
        violence,
        requirement(
          "valor-gal-violencia",
          text(
            "Precio ≤240.000 € +30.000 € por miembro después del primero; sin test de patrimonio en este supuesto",
            "Price ≤€240,000 +€30,000 per member after the first; no assets test for this relief",
          ),
          ["miembrosFamilia"],
          (c) => {
            const limit = galLimit(c);
            return known(limit)
              ? cents(c.input.precio) <= cents(limit)
              : "unknown";
          },
        ),
      ],
    ],
  ];
  for (const [id, reqs] of cohorts) {
    add(
      "galicia",
      tax,
      id,
      `Vivienda habitual: ${id}`,
      `Main residence: ${id}`,
      flat(tax === "ITP" ? 3 : 0.5),
      [...resident, deed, ...reqs],
      20,
      "arts. 14 y 15; Ley 5/2025",
    );
    add(
      "galicia",
      tax,
      `rural-${id}`,
      `Deducción rural del 100 %: ${id}`,
      `100% rural deduction: ${id}`,
      quota(flat(tax === "ITP" ? 3 : 0.5), 100, "deduccion"),
      [...resident, deed, ...reqs, rural],
      30,
      tax === "ITP" ? "art. 16.7" : "art. 17.8",
    );
  }
}
add(
  "galicia",
  "ITP",
  "rural-general",
  "Vivienda en parroquia rural oficial",
  "Home in an officially designated rural parish",
  flat(6),
  [rural],
  5,
  "art. 14",
);
add(
  "galicia",
  "ITP",
  "rural-habitual",
  "Vivienda habitual rural con límites",
  "Rural main home within statutory limits",
  flat(5),
  [...resident, rural, galBounds(), deed],
  15,
  "art. 14",
);

// Asturias: ordinary and reduced bands select a rate for the WHOLE value.
add(
  "asturias",
  "ITP",
  "habitual-colectivos",
  "Vivienda habitual de colectivo o concejo rural elegible",
  "Main residence for a qualifying group or designated rural council",
  bands("whole-value", [
    [150000, 4],
    [null, 6],
  ]),
  [
    habitual,
    yes(
      "ocupacionMantenimiento",
      "Ocupación en seis meses y residencia tres años; excepciones del art. 32 bis.2",
      "Occupation within six months and residence for three years; art. 32 bis.2 exceptions",
    ),
    group(
      "colectivos-asturias",
      age(36),
      family("numerosa"),
      family("monoparental"),
      violence,
      rural,
    ),
  ],
  20,
  "art. 32 bis; Decreto 83/2025; Ley 5/2025",
);
add(
  "asturias",
  "ITP",
  "protegida",
  "Vivienda protegida con precio máximo; sin otra vivienda",
  "Price-capped protected home; no other home",
  flat(3),
  [...resident, protectedHome, noOther],
  30,
  "art. 27",
);
add(
  "asturias",
  "ITP",
  "gran-tenedor",
  "Tipo agravado: gran tenedor o edificio turístico",
  "Surcharge: statutory large holder or tourist building",
  flat(20),
  [
    group(
      "agravado-asturias",
      yes(
        "granTenedor",
        "Gran tenedor conforme al art. 31 bis (incluida la adquisición)",
        "Large holder under art. 31 bis (including this acquisition)",
      ),
      yes(
        "edificioTuristico",
        "Edificio con destino turístico en el supuesto del art. 31 bis",
        "Tourist building within the conditions of art. 31 bis",
      ),
    ),
    requirement(
      "no-exclusion",
      text(
        "No concurre una exclusión legal del tipo agravado",
        "No statutory exclusion from the surcharge applies",
      ),
      ["exclusionGranTenedor"],
      (c) =>
        c.input.exclusionGranTenedor === undefined
          ? "unknown"
          : !c.input.exclusionGranTenedor,
    ),
  ],
  900,
  "art. 31 bis; Ley 3/2025",
);
add(
  "asturias",
  "AJD",
  "protegida-ayudas",
  "Vivienda protegida habitual con ayudas públicas, no exenta",
  "Non-exempt protected main home with public purchase assistance",
  flat(0.3),
  [
    ...resident,
    protectedHome,
    yes(
      "ayudaPublicaAdquisicion",
      "Ayuda económica estatal o autonómica para esta adquisición acreditada",
      "State or regional financial assistance for this purchase evidenced",
    ),
  ],
  20,
  "art. 35",
);

// Illes Balears: never round an eligibility ceiling up. DA 5 caps the subsidised part.
export const BALEAR_BENEFIT_BASE = 270151.2;
export function balearLimit(
  c: Context,
  familyExtension = false,
): number | undefined {
  if (!c.input.isla) return undefined;
  const date = c.input.fecha;
  let value =
    date < "2026-03-01"
      ? BALEAR_BENEFIT_BASE
      : c.input.isla === "eivissa" || c.input.isla === "formentera"
        ? 378211.68
        : date >= "2026-06-14"
          ? 331859.7
          : c.input.isla === "mallorca"
            ? 307089
            : BALEAR_BENEFIT_BASE;
  if (
    familyExtension &&
    date >= "2026-06-14" &&
    c.input.familia !== "monoparental-general"
  )
    value *= 1.15;
  return value;
}
const islandCap = (extension = false) =>
  requirement(
    extension ? "tope-isla-familia" : "tope-isla",
    text(
      extension
        ? "Valor dentro del límite insular aplicable a la categoría familiar"
        : "Valor dentro del límite de la isla en la fecha del devengo",
      extension
        ? "Value within the island ceiling for the certified family category"
        : "Value within the island ceiling on the purchase date",
    ),
    ["isla", ...(extension ? ["familia" as const] : [])],
    (c) => {
      const limit = balearLimit(c, extension);
      return known(limit)
        ? cents(c.valor) <= Math.floor(limit * 100 + 1e-6)
        : "unknown";
    },
  );
const halfShare = requirement(
  "adquisicion50",
  text(
    "Se adquiere ≥50 % de la plena propiedad/uso de la vivienda",
    "At least 50% full ownership/use of the home is acquired",
  ),
  ["porcentaje"],
  (c) => known(c.input.porcentaje) ? c.input.porcentaje >= 50 : "unknown",
);
const noHalfOther = numberTest(
  "otraViviendaPorcentaje",
  "No se posee ≥50 % de plena propiedad o uso/disfrute de otra vivienda",
  "No ≥50% full ownership or use/enjoyment rights over another home",
  (n) => n >= 0 && n < 50,
);
const balBasics = [...resident, halfShare, noHalfOther];
const balParent = yes(
  "progenitorConviviente",
  "Comprador padre/madre que convive con los hijos sometidos a su patria potestad",
  "Buyer is a parent living with the children under their parental authority",
);
add(
  "baleares",
  "ITP",
  "familia-anterior",
  "Familia: límite previo a 14/06/2026 y beneficio parcial",
  "Family: pre-14/06/2026 ceiling and partial relief",
  partial(BALEAR_BENEFIT_BASE, 2, 8),
  [
    ...balBasics,
    balParent,
    group(
      "familia-balear-anterior",
      family("numerosa"),
      family("monoparental"),
    ),
    requirement(
      "tope-familia-anterior",
      text(
        "Familia numerosa/monoparental especial: valor ≤350.000 €; monoparental general: límite insular ordinario",
        "Large/special single-parent family: value ≤€350,000; general single-parent family: ordinary island ceiling",
      ),
      ["familia", "isla"],
      (c) =>
        c.input.familia === undefined
          ? "unknown"
          : c.input.familia === "monoparental-general"
            ? islandCap().check(c)
            : cents(c.valor) <= 35000000,
    ),
  ],
  20,
  "art. 10.d.3, redacción Ley 12/2023; DA 5",
  COVERAGE_FROM,
  "2026-06-13",
);
const balMinimum = yes(
  "minimoDiscapacidad",
  "Derecho al mínimo IRPF por discapacidad de ascendientes/descendientes",
  "Entitlement to the IRPF disability allowance for an ascendant/dependent",
);
const balFull = [
  ...balBasics,
  first,
  islandCap(),
  group("joven30-discapacidad", age(30), degree(33)),
  numberTest(
    "residenciaBaleares",
    "Residencia habitual en Illes Balears durante los tres años anteriores",
    "Habitual residence in the Balearics throughout the previous three years",
    (n) => n >= 3,
  ),
  income(52800, 84480),
  requirement(
    "hipoteca60",
    text(
      "Hipoteca con entidad financiera ≥60 % de la tasación",
      "Mortgage from a financial institution ≥60% of appraisal",
    ),
    ["hipoteca", "tasacion", "entidadCredito", "hipotecaSobreInmueble"],
    (c) => {
      if (
        c.input.entidadCredito === false ||
        c.input.hipotecaSobreInmueble === false
      )
        return false;
      if (
        !known(c.input.hipoteca) ||
        !known(c.input.tasacion) ||
        c.input.tasacion <= 0 ||
        c.input.entidadCredito === undefined ||
        c.input.hipotecaSobreInmueble === undefined
      )
        return "unknown";
      return cents(c.input.hipoteca) * 100 >= cents(c.input.tasacion) * 60;
    },
  ),
];
for (const tax of ["ITP", "AJD"] as const) {
  const from = tax === "ITP" ? COVERAGE_FROM : "2026-06-14",
    excess = tax === "ITP" ? 8 : 1.5;
  const basics = tax === "ITP" ? balBasics : [...balBasics, first];
  add(
    "baleares",
    tax,
    "habitual-parcial",
    "Beneficio sobre los primeros 270.151,20 €; exceso general",
    "Relief on the first €270,151.20; general rate on excess",
    partial(BALEAR_BENEFIT_BASE, tax === "ITP" ? 4 : 1, excess),
    [...basics, islandCap()],
    10,
    "arts. 10.c / 17; DA 5; corrección ATIB 23/06/2026",
    from,
  );
  add(
    "baleares",
    tax,
    "joven-minimo-parcial",
    "Joven/ mínimo por discapacidad: beneficio parcial",
    "Young buyer / dependent-disability allowance: partial relief",
    partial(BALEAR_BENEFIT_BASE, tax === "ITP" ? 2 : 0.5, excess),
    [
      ...basics,
      islandCap(),
      group(
        "joven-minimo",
        all(
          "joven-primera",
          text("Menor de 36 y primera vivienda", "Under 36 and first home"),
          age(36),
          first,
        ),
        balMinimum,
      ),
    ],
    20,
    "arts. 10.d / 17.2; DA 5",
    from,
  );
  add(
    "baleares",
    tax,
    "familia-parcial",
    "Familia acreditada: límite insular específico y beneficio parcial",
    "Certified family: specific island ceiling and partial relief",
    partial(BALEAR_BENEFIT_BASE, tax === "ITP" ? 2 : 0.5, excess),
    [
      ...basics,
      islandCap(true),
      balParent,
      group("familia-balear", family("numerosa"), family("monoparental")),
    ],
    20,
    "arts. 10.d.3 / 17.2.c; DA 5",
    "2026-06-14",
  );
  add(
    "baleares",
    tax,
    "bonificacion100-parcial",
    "Bonificación del 100 % limitada a los primeros 270.151,20 €",
    "100% relief limited to the first €270,151.20",
    quota(flat(excess), 100, "bonificacion", BALEAR_BENEFIT_BASE),
    balFull,
    40,
    "arts. 14 quater / 19 quater y DA 5",
    from,
  );
  // VPL relief applies to the resulting tax bill, including a legally compatible reduced tariff.
  for (const [id, underlying, reqs, priority] of [
    ["general", general.baleares[tax === "ITP" ? "itp" : "ajd"], [], 15],
    [
      "habitual",
      partial(BALEAR_BENEFIT_BASE, tax === "ITP" ? 4 : 1, excess),
      [...basics, islandCap()],
      16,
    ],
    [
      "joven",
      partial(BALEAR_BENEFIT_BASE, tax === "ITP" ? 2 : 0.5, excess),
      [
        ...basics,
        islandCap(),
        group(
          "joven-minimo-vpl",
          all(
            "joven-primera-vpl",
            text("Menor de 36 y primera vivienda", "Under 36 and first home"),
            age(36),
            first,
          ),
          balMinimum,
        ),
      ],
      25,
    ],
    [
      "familia",
      partial(BALEAR_BENEFIT_BASE, tax === "ITP" ? 2 : 0.5, excess),
      [
        ...basics,
        islandCap(true),
        balParent,
        group("familia-vpl", family("numerosa"), family("monoparental")),
      ],
      25,
    ],
  ] as [string, Tariff, Requirement[], number][])
    add(
      "baleares",
      tax,
      `vpl50-${id}`,
      "VPL: bonificación del 50 % de la cuota",
      "VPL: 50% relief on the tax bill",
      quota(underlying, 50),
      [
        tax === "AJD"
          ? group(
              "vpl-o-tasada",
              protection("vpl"),
              protection("precio-tasado-balear"),
            )
          : protection("vpl"),
        ...reqs,
      ],
      priority,
      "arts. 14 septies / 19 quinquies; Ley 4/2026",
      "2026-06-14",
    );
}

// Madrid: quota relief, not an unconditionally lower nominal rate; age is UNDER 35.
for (const tax of ["ITP", "AJD"] as const) {
  const base = general.madrid[tax === "ITP" ? "itp" : "ajd"];
  add(
    "madrid",
    tax,
    "habitual10",
    "Bonificación del 10 % por vivienda habitual hasta 250.000 €",
    "10% tax-bill relief for a main home up to €250,000",
    quota(base, 10),
    [...resident, cap(250000)],
    10,
    "arts. 30 bis / 38 bis",
  );
  add(
    "madrid",
    tax,
    "joven-rural100",
    "Menor de 35: bonificación del 100 % en municipio <2.500 habitantes",
    "Under 35: 100% relief in a municipality below 2,500 residents",
    quota(base, 100),
    [...resident, cap(250000), age(35), rural, deed],
    30,
    "arts. 30 bis / 38 bis; población INE a 1 de enero del año anterior",
  );
  add(
    "madrid",
    tax,
    "numerosa",
    "Familia numerosa con requisitos de vivienda anterior",
    "Large family meeting previous-home conditions",
    tax === "ITP" ? flat(4) : quota(base, 95),
    [...resident, family("numerosa"), soldOrNone, deed],
    20,
    "arts. 29 / 38 ter",
  );
}
add(
  "madrid",
  "AJD",
  "protegida90",
  "Protección pública hasta 90 m² útiles, no exenta",
  "Non-exempt public-protection housing up to 90 m² usable area",
  flat(0.2),
  [
    protectedHome,
    numberTest(
      "superficieUtil",
      "Superficie útil ≤90 m²",
      "Usable area ≤90 m²",
      (n) => n > 0 && n <= 90,
    ),
  ],
  10,
  "art. 32.1",
);

// Aragón explicitly permits stacking the three 12.5% quota rebates.
const aragonCohorts = [age(35), degree(65), violence];
add(
  "aragon",
  "ITP",
  "colectivos-acumulables",
  "Bonificaciones compatibles del 12,5 %",
  "Compatible 12.5% tax-bill rebates",
  (c) =>
    quota(
      general.aragon.itp,
      12.5 * aragonCohorts.filter((r) => r.check(c) === true).length,
    ),
  [...resident, cap(100000), group("colectivos-aragon", ...aragonCohorts)],
  10,
  "art. 121-4",
);
const replacementLarger = any(
  "primera-o-sustitucion",
  text(
    "Primera vivienda, o sustitución/agrupación con incremento de superficie >10 % y venta en plazo",
    "First home, or replacement/merger with >10% floor-area increase and timely sale",
  ),
  first,
  all(
    "sustitucion-mayor",
    text(
      "Venta/agrupación y superficie superior al 110 % de la anterior",
      "Timely sale/merger and floor area above 110% of the previous home",
    ),
    any(
      "venta-agrupacion",
      text(
        "Venta o agrupación contigua en plazo",
        "Timely sale or adjoining-property merger",
      ),
      yes(
        "ventaAnterior",
        "Venta anterior en el plazo legal",
        "Previous home sold within the statutory period",
      ),
      yes(
        "ampliacionContigua",
        "Agrupación con vivienda contigua",
        "Merger with adjoining home",
      ),
    ),
    requirement(
      "superficie110",
      text(
        "Superficie útil nueva >110 % de la anterior",
        "New usable area >110% of previous home",
      ),
      ["superficieUtil", "superficieAnterior"],
      (c) =>
        known(c.input.superficieUtil) && known(c.input.superficieAnterior)
          ? c.input.superficieUtil > c.input.superficieAnterior * 1.1
          : "unknown",
    ),
  ),
);
const familyAdjusted = (base: number, increment: number, strict = false) =>
  requirement(
    `renta-familia-${base}`,
    text(
      `Renta familiar ajustada ${strict ? "<" : "≤"}${base} € +${increment} € por hijo sobre el mínimo legal de familia numerosa`,
      `Adjusted household income ${strict ? "<" : "≤"}€${base} +€${increment} per child above the statutory large-family minimum`,
    ),
    ["rentaFamiliar", "hijos", "hijosMinimosNumerosa"],
    (c) => {
      if (
        !known(c.input.rentaFamiliar) ||
        !known(c.input.hijos) ||
        !known(c.input.hijosMinimosNumerosa)
      )
        return "unknown";
      const limit =
        base +
        increment * Math.max(0, c.input.hijos - c.input.hijosMinimosNumerosa);
      return strict
        ? cents(c.input.rentaFamiliar) < cents(limit)
        : cents(c.input.rentaFamiliar) <= cents(limit);
    },
  );
for (const tax of ["ITP", "AJD"] as const)
  add(
    "aragon",
    tax,
    "numerosa",
    "Familia numerosa: bonificación de cuota",
    "Large family: tax-bill relief",
    quota(
      general.aragon[tax === "ITP" ? "itp" : "ajd"],
      tax === "ITP" ? 50 : 60,
    ),
    [
      ...resident,
      family("numerosa"),
      replacementLarger,
      familyAdjusted(35000, 6000),
      deed,
    ],
    20,
    "arts. 121-5 / 122-3",
  );
for (const tax of ["ITP", "AJD"] as const)
  add(
    "aragon",
    tax,
    "numerosa-rural",
    "Familia numerosa: bonificación rural acreditada",
    "Large family: evidenced rural tax-bill relief",
    quota(
      general.aragon[tax === "ITP" ? "itp" : "ajd"],
      tax === "ITP" ? 60 : 70,
    ),
    [
      ...resident,
      family("numerosa"),
      replacementLarger,
      familyAdjusted(35000, 6000),
      deed,
      rural,
      yes(
        "residenciaRuralPlazos",
        "Asentamiento de rangos VIII–X con ISDT <100; residencia año del devengo y cuatro siguientes, o traslado y permanencia cuatro años (art. 160-1)",
        "Settlement in ranges VIII–X with ISDT <100; residence during purchase year plus four years, or relocation and four-year retention (art. 160-1)",
      ),
    ],
    30,
    "arts. 160-1 y 160-3",
  );

// Castilla y León: adjusted IRPF includes the statutory personal/family-minimum deduction.
const cylIncome = requirement(
  "renta-cyl",
  text(
    "IRPF ajustado conjunto de adquirentes/unidad familiar ≤31.500 €; familia numerosa 37.800 € +6.000 € por miembro adicional sobre el mínimo legal",
    "Combined adjusted buyers/household IRPF ≤€31,500; large family €37,800 +€6,000 per member above the statutory minimum",
  ),
  ["rentaFamiliar", "familia", "miembrosFamilia", "miembrosMinimosNumerosa"],
  (c) => {
    if (!known(c.input.rentaFamiliar) || !c.input.familia) return "unknown";
    if (!c.input.familia.startsWith("numerosa"))
      return cents(c.input.rentaFamiliar) <= 3150000;
    if (
      !known(c.input.miembrosFamilia) ||
      !known(c.input.miembrosMinimosNumerosa)
    )
      return "unknown";
    return (
      cents(c.input.rentaFamiliar) <=
      cents(
        37800 +
          6000 *
            Math.max(
              0,
              c.input.miembrosFamilia - c.input.miembrosMinimosNumerosa,
            ),
      )
    );
  },
);
for (const tax of ["ITP", "AJD"] as const) {
  const reqs = [...resident, cylIncome, deed];
  add(
    "castilla-y-leon",
    tax,
    "joven-protegida",
    "Primera vivienda: joven o protegida",
    "First home: young buyer or protected housing",
    flat(tax === "ITP" ? 4 : 0.5),
    [...reqs, first, group("joven-protegida-cyl", age(36), protectedHome)],
    20,
    "arts. 25–28",
  );
  add(
    "castilla-y-leon",
    tax,
    "familia-discapacidad",
    "Familia numerosa o discapacidad ≥65 %",
    "Large family or disability ≥65%",
    flat(tax === "ITP" ? 4 : 0.5),
    [
      ...reqs,
      soldOrNone,
      group(
        "familia-discapacidad-cyl",
        family("numerosa"),
        degree(65),
        all(
          "familia65-cyl",
          text(
            "Discapacidad ≥65 % de miembro familiar computable",
            "Qualifying family-member disability ≥65%",
          ),
          numberTest(
            "gradoDiscapacidadFamiliar",
            "Discapacidad familiar ≥65 %",
            "Family-member disability ≥65%",
            (n) => n >= 65,
          ),
          yes(
            "nucleoFamiliarAcreditado",
            "Núcleo familiar legal acreditado",
            "Statutory family unit evidenced",
          ),
        ),
      ),
    ],
    20,
    "arts. 25–28",
  );
  add(
    "castilla-y-leon",
    tax,
    "joven-rural",
    "Primera vivienda de joven en municipio elegible",
    "Young buyer’s first home in an eligible municipality",
    flat(0.01),
    [
      ...reqs,
      first,
      age(36),
      rural,
      requirement(
        "valor-menor150",
        text("Valor inferior a 150.000 €", "Value strictly below €150,000"),
        [],
        (c) => cents(c.valor) < 15000000,
      ),
    ],
    30,
    "arts. 25.3, 26 y 7.1.c",
  );
}

// Cataluña: 20% is an exceptional surcharge, not the upper ordinary progressive band.
const catIncome = numberTest(
  "renta",
  "Base general + ahorro menos mínimo personal/familiar ≤36.000 €",
  "General + savings bases less personal/family allowance ≤€36,000",
  (n) => cents(n) <= 3600000,
);
add(
  "cataluna",
  "ITP",
  "joven",
  "Joven de hasta 35 años y renta ajustada limitada",
  "Buyer aged 35 or younger, within adjusted-income limit",
  flat(5),
  [...resident, age(36), catIncome, deed],
  20,
  "art. 641-5",
);
add(
  "cataluna",
  "ITP",
  "violencia",
  "Cambio de vivienda habitual por violencia machista",
  "Main-home relocation because of gender-based violence",
  flat(5),
  [
    ...resident,
    violence,
    catIncome,
    yes(
      "cambioDomicilioViolencia",
      "La adquisición obedece a la necesidad de cambiar de domicilio por la violencia acreditada",
      "Purchase is necessary to relocate because of the evidenced violence",
    ),
    deed,
  ],
  20,
  "art. 641-5 bis",
);
for (const [special, rate] of [
  [false, 4],
  [true, 3],
] as const) {
  const area = requirement(
    "atencion-especial-cat",
    text(
      special
        ? "Municipio rural de atención especial, clasificación oficial"
        : "Municipio rural ordinario, clasificación oficial",
      special
        ? "Official special-attention rural municipality"
        : "Official ordinary rural municipality",
    ),
    ["ruralAtencionEspecial"],
    (c) =>
      c.input.ruralAtencionEspecial === undefined
        ? "unknown"
        : c.input.ruralAtencionEspecial === special,
  );
  add(
    "cataluna",
    "ITP",
    `rural-hijos-${rate}`,
    "Vivienda habitual rural de familia con hijos escolarizados",
    "Rural main home for a family with qualifying school-age children",
    flat(rate),
    [
      ...resident,
      rural,
      area,
      yes(
        "hijosEscolarizadosRural",
        "Unidad familiar con hijos de hasta 16 años escolarizados en el municipio o centro adscrito; hasta 3 años, sin requisito escolar",
        "Household with children up to 16 attending the local/assigned school; children up to 3 need not attend school",
      ),
      numberTest(
        "rentaFamiliar",
        "IRPF familiar (general + ahorro menos mínimos) ≤36.000 €",
        "Household IRPF (general + savings less allowances) ≤€36,000",
        (n) => n <= 36000,
      ),
      deed,
    ],
    30,
    "Ley 8/2025, art. 62 y DT 1.3; ATC: hasta 16/07/2029",
    COVERAGE_FROM,
    "2029-07-16",
    "BOE-A-2025-16833",
  );
  add(
    "cataluna",
    "ITP",
    `rural-rehabilitacion-${rate}`,
    "Rehabilitación de vivienda habitual rural anterior a 1970",
    "Rehabilitation of a pre-1970 rural main home",
    flat(rate),
    [
      habitual,
      rural,
      area,
      catIncome,
      yes(
        "rehabilitacion",
        "Adquisición para rehabilitar conforme al art. 63",
        "Purchase for rehabilitation under art. 63",
      ),
      yes(
        "construccionAnterior1970",
        "Vivienda construida antes del 01/01/1970",
        "Home built before 01/01/1970",
      ),
      yes(
        "rehabilitacionEstructural",
        "Objeto principal: reconstrucción mediante estructuras, fachadas, cubiertas o análogas",
        "Main purpose: reconstruction of structures, façades, roofs or equivalent",
      ),
      requirement(
        "coste-rehab25",
        text(
          "Coste global de rehabilitación >25 % del precio sin suelo (valor de mercado sin suelo si procede según art. 63.3.a)",
          "Total rehabilitation cost >25% of price excluding land (market value excluding land where art. 63.3.a applies)",
        ),
        ["costeRehabilitacion", "valorSinSuelo"],
        (c) =>
          known(c.input.costeRehabilitacion) &&
          known(c.input.valorSinSuelo) &&
          c.input.valorSinSuelo > 0
            ? cents(c.input.costeRehabilitacion) * 4 >
              cents(c.input.valorSinSuelo)
            : "unknown",
      ),
      yes(
        "rehabilitacionPlazos",
        "Obras terminadas en dos años; ocupación en doce meses y permanencia tres años desde fin de obras, salvo excepciones legales",
        "Works completed within two years; occupation within twelve months and residence for three years from completion, subject to statutory exceptions",
      ),
      deed,
    ],
    30,
    "Ley 8/2025, art. 63 y DT 1.3; ATC: hasta 16/07/2029",
    COVERAGE_FROM,
    "2029-07-16",
    "BOE-A-2025-16833",
  );
}
add(
  "cataluna",
  "AJD",
  "joven100",
  "Joven de hasta 35 años: bonificación del 100 %",
  "Buyer aged 35 or younger: 100% AJD rebate",
  quota(flat(1.5), 100),
  [...resident, age(36), catIncome, deed],
  20,
  "art. 642-6; Decreto-ley 5/2025",
);
add(
  "cataluna",
  "ITP",
  "protegida",
  "Vivienda de protección oficial",
  "Officially protected home",
  flat(7),
  [protectedHome],
  10,
  "art. 641-1.2",
);
add(
  "cataluna",
  "ITP",
  "discapacidad",
  "Discapacidad ≥65 % y renta familiar ajustada limitada",
  "Disability ≥65% and limited adjusted household income",
  flat(5),
  [
    ...resident,
    group(
      "discapacidad-familiar-cat",
      degree(65),
      all(
        "familiar65-cat",
        text(
          "Discapacidad ≥65 % en miembro de la unidad familiar IRPF",
          "Disability ≥65% in a member of the IRPF household",
        ),
        numberTest(
          "gradoDiscapacidadFamiliar",
          "Discapacidad familiar ≥65 %",
          "Family-member disability ≥65%",
          (n) => n >= 65,
        ),
        yes(
          "nucleoFamiliarAcreditado",
          "Unidad familiar conforme al IRPF acreditada",
          "IRPF household evidenced",
        ),
      ),
    ),
    numberTest(
      "rentaFamiliar",
      "Renta familiar ajustada ≤36.000 €",
      "Adjusted household income ≤€36,000",
      (n) => n <= 36000,
    ),
    deed,
  ],
  20,
  "art. 641-4",
);
for (const kind of ["numerosa", "monoparental"] as const)
  add(
    "cataluna",
    "ITP",
    kind,
    `Familia ${kind} con límite de renta`,
    `Qualifying ${kind === "numerosa" ? "large" : "single-parent"} family income`,
    flat(5),
    [
      ...resident,
      family(kind),
      kind === "numerosa"
        ? familyAdjusted(36000, 14000)
        : requirement(
            "renta-monoparental-cat",
            text(
              "IRPF familiar ajustado ≤36.000 € +14.000 € por hijo sobre el mínimo legal de monoparental especial",
              "Adjusted household IRPF ≤€36,000 +€14,000 per child above the statutory special single-parent minimum",
            ),
            ["rentaFamiliar", "hijos", "hijosMinimosMonoparentalEspecial"],
            (c) =>
              known(c.input.rentaFamiliar) &&
              known(c.input.hijos) &&
              known(c.input.hijosMinimosMonoparentalEspecial)
                ? cents(c.input.rentaFamiliar) <=
                  cents(
                    36000 +
                      14000 *
                        Math.max(
                          0,
                          c.input.hijos -
                            c.input.hijosMinimosMonoparentalEspecial,
                        ),
                  )
                : "unknown",
          ),
      deed,
    ],
    20,
    kind === "numerosa" ? "art. 641-2" : "art. 641-3",
  );
add(
  "cataluna",
  "ITP",
  "agravado",
  "Gran tenedor o edificio entero: tipo agravado",
  "Large holder or whole residential building: surcharge",
  flat(20),
  [
    group(
      "agravado-cat",
      yes(
        "granTenedor",
        "Gran tenedor según art. 641-1.5",
        "Large holder as defined in art. 641-1.5",
      ),
      yes(
        "edificioEntero",
        "Adquisición de edificio entero de viviendas",
        "Acquisition of an entire residential building",
      ),
    ),
    requirement(
      "sin-excepcion-cat",
      text(
        "No concurre ninguna exclusión de los apartados 5 y 6",
        "No exclusion under paragraphs 5 and 6 applies",
      ),
      ["exclusionGranTenedor"],
      (c) =>
        c.input.exclusionGranTenedor === undefined
          ? "unknown"
          : !c.input.exclusionGranTenedor,
    ),
  ],
  900,
  "art. 641-1.5–6; Decreto-ley 5/2025",
);

// Murcia and La Rioja: current ages and strict/inclusive income boundaries differ.
const murYoungIncome = [
  numberTest(
    "renta",
    "Base general menos mínimo personal/familiar <40.000 €",
    "General taxable base minus personal/family allowance <€40,000",
    (n) => cents(n) < 4000000,
  ),
  numberTest(
    "rentaAhorro",
    "Base imponible del ahorro ≤1.800 €",
    "Savings taxable base ≤€1,800",
    (n) => cents(n) <= 180000,
  ),
];
for (const tax of ["ITP", "AJD"] as const) {
  add(
    "murcia",
    tax,
    "joven",
    "Comprador de hasta 40 años y renta limitada",
    "Buyer aged 40 or younger, with limited income",
    flat(tax === "ITP" ? 3 : 0.1),
    [...resident, age(41), ...murYoungIncome, deed],
    20,
    "arts. 6 y 7",
  );
  add(
    "murcia",
    tax,
    "discapacidad",
    "Discapacidad ≥65 % y renta limitada",
    "Disability ≥65% and limited income",
    flat(tax === "ITP" ? 3 : 0.1),
    [...resident, degree(65), ...murYoungIncome, deed],
    20,
    "arts. 6.9 y 7.6",
  );
  add(
    "murcia",
    tax,
    "numerosa",
    "Familia numerosa con requisitos de renta y sustitución",
    "Large family meeting income and replacement requirements",
    flat(tax === "ITP" ? 3 : 0.1),
    [
      ...resident,
      family("numerosa"),
      replacementLarger,
      familyAdjusted(44000, 6000, true),
      deed,
    ],
    20,
    "arts. 6 y 7",
  );
}
add(
  "murcia",
  "ITP",
  "vpo-especial",
  "VPO de régimen especial",
  "Special-regime VPO",
  flat(4),
  [protection("especial")],
  10,
  "art. 6",
);
add(
  "la-rioja",
  "ITP",
  "joven",
  "Menor de 40 años: primera vivienda habitual",
  "Under 40: first main residence",
  flat(4),
  [...resident, first, age(40), deed],
  20,
  "art. 45",
);
add(
  "la-rioja",
  "ITP",
  "joven-rural",
  "Joven: primera vivienda en municipio del anexo I",
  "Young buyer: first home in an Annex I municipality",
  flat(3),
  [...resident, first, age(40), rural, deed],
  30,
  "art. 45 y anexo I",
);
for (const tax of ["ITP", "AJD"] as const)
  add(
    "la-rioja",
    tax,
    "familia-discapacidad",
    "Familia numerosa o discapacidad ≥33 %",
    "Large family or disability ≥33%",
    flat(tax === "ITP" ? 5 : 0.1),
    [
      ...resident,
      group("familia-discapacidad-rioja", family("numerosa"), degree(33)),
      deed,
    ],
    10,
    "arts. 45 y 49",
  );
add(
  "la-rioja",
  "ITP",
  "vpo",
  "Primera vivienda protegida y renta limitada",
  "First protected home with limited income",
  flat(5),
  [
    ...resident,
    first,
    protectedHome,
    income(18030, 30050),
    numberTest(
      "rentaAhorro",
      "Base liquidable del ahorro ≤1.800 €",
      "Savings taxable base ≤€1,800",
      (n) => n <= 1800,
    ),
    deed,
  ],
  10,
  "art. 45",
);
add(
  "la-rioja",
  "ITP",
  "numerosa3",
  "Familia numerosa: vivienda mayor dentro del plazo de cinco años",
  "Large family: larger home within the five-year period",
  flat(3),
  [
    ...resident,
    family("numerosa"),
    replacementLarger,
    numberTest(
      "rentaFamiliar",
      "IRPF de todos los ocupantes menos mínimos ≤30.600 €",
      "All occupants’ IRPF bases less allowances ≤€30,600",
      (n) => n <= 30600,
    ),
    requirement(
      "familia-plazo5",
      text(
        "Compra y venta anterior, si existe, en los cinco años siguientes al título/nacimiento/adopción habilitante",
        "Purchase and previous-home sale, if applicable, within five years of the qualifying certificate/birth/adoption",
      ),
      ["fechaTituloFamilia", "ventaAnterior", "otraViviendaPorcentaje"],
      (c) => {
        const d = c.input.fechaTituloFamilia;
        if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return "unknown";
        const end = `${Number(d.slice(0, 4)) + 5}${d.slice(4)}`;
        if (d > c.input.fecha || c.input.fecha > end) return false;
        return soldOrNone.check(c);
      },
    ),
    deed,
  ],
  30,
  "art. 45.1",
);

// Navarra: reduced first slice only, and prior ownership is tested throughout Navarra.
const navFullTitle = yes(
  "plenoDominioSinConsolidacion",
  "Adquisición del pleno dominio, no consolidación de usufructo y nuda propiedad previos",
  "Acquisition of full title, not consolidation of a previously split usufruct and bare ownership",
);
add(
  "navarra",
  "ITP",
  "rural",
  "Vivienda habitual en municipio oficialmente en riesgo de despoblación",
  "Main home in an officially designated depopulation-risk municipality",
  flat(4),
  [...resident, rural, navFullTitle, deed],
  20,
  "art. 8.1.b.2; Ley Foral 22/2023",
);
add(
  "navarra",
  "ITP",
  "familia-dos-hijos",
  "Unidad familiar con dos o más hijos: primeros 180.304 € al 5 %",
  "Household with at least two children: 5% on first €180,304",
  partial(180304, 5, 6),
  [
    ...resident,
    navFullTitle,
    numberTest(
      "hijos",
      "Unidad familiar con al menos dos hijos",
      "Household with at least two children",
      (n) => n >= 2,
    ),
    numberTest(
      "otraViviendaNavarraPorcentaje",
      "Ningún miembro familiar posee >25 % de otra vivienda en Navarra",
      "No household member owns >25% of another home in Navarra",
      (n) => n <= 25,
    ),
    deed,
  ],
  10,
  "art. 8.1.b.1",
);

// Foral housing tariffs: current rules no longer impose the old one-use restriction in Bizkaia/Gipuzkoa.
for (const [territory, url, article] of [
  [
    "alava",
    "https://web.araba.eus/documents/d/araba/indice_norma-foral-itp-ajd-cas-2-pdf",
    "NF 11/2003, art. 43",
  ],
  [
    "bizkaia",
    "https://www.bizkaia.eus/documents/880307/15187815/ca_1_2011.pdf",
    "NF 1/2011, art. 13",
  ],
  [
    "gipuzkoa",
    "https://www.gipuzkoa.eus/es/web/ogasuna/impuestos/modelo/60t/tipos-impositivos",
    "NF 18/1987, art. 11; NF 1/2025",
  ],
] as const) {
  const territoryReq = requirement(
    `territorio-${territory}`,
    text(
      `Territorio histórico: ${territory}`,
      `Historical territory: ${territory}`,
    ),
    ["territorioForal"],
    (c) =>
      c.input.territorioForal
        ? c.input.territorioForal === territory
        : "unknown",
  );
  const ownership = numberTest(
    "otraViviendaMunicipioPorcentaje",
    "No se posee >25 % de otra vivienda en el mismo municipio",
    "No >25% ownership of another home in the same municipality",
    (n) => n <= 25,
  );
  const ownershipReq =
    territory === "alava"
      ? ownership
      : any(
          "titularidad-o-venta-foral",
          text(
            "Titularidad en el municipio ≤25 %, o venta de la vivienda anterior en dos años",
            "Local ownership ≤25%, or sale of the previous home within two years",
          ),
          ownership,
          yes(
            "ventaAnterior",
            "Venta en los dos años siguientes a la adquisición",
            "Sale within two years after purchase",
          ),
        );
  const surface = requirement(
    `superficie-${territory}`,
    text(
      territory === "gipuzkoa"
        ? "Superficie ≤120 m² construidos o ≤96 m² útiles; unifamiliar: parcela ≤300 m²"
        : "Superficie ≤120 m² construidos; unifamiliar: parcela ≤300 m²",
      territory === "gipuzkoa"
        ? "Area ≤120 m² built or ≤96 m² usable; detached/individual-entry home: plot ≤300 m²"
        : "Area ≤120 m² built; detached/individual-entry home: plot ≤300 m²",
    ),
    [
      "superficieConstruida",
      ...(territory === "gipuzkoa" ? ["superficieUtil" as const] : []),
      "unifamiliar",
      "parcela",
    ],
    (c) => {
      const built = known(c.input.superficieConstruida)
        ? c.input.superficieConstruida > 0 &&
          c.input.superficieConstruida <= 120
        : "unknown";
      const usable =
        territory === "gipuzkoa" && known(c.input.superficieUtil)
          ? c.input.superficieUtil > 0 && c.input.superficieUtil <= 96
          : "unknown";
      if (built !== true && usable !== true)
        return built === false && (territory !== "gipuzkoa" || usable === false)
          ? false
          : "unknown";
      if (c.input.unifamiliar === undefined) return "unknown";
      if (!c.input.unifamiliar) return true;
      return known(c.input.parcela) ? c.input.parcela <= 300 : "unknown";
    },
  );
  add(
    "pais-vasco",
    "ITP",
    `${territory}-titular6`,
    "Titular de más de cinco viviendas en más del 50 %",
    "Owner of more than five homes, each held above 50%",
    flat(6),
    [
      territoryReq,
      numberTest(
        "numeroViviendas",
        "Más de cinco viviendas en titularidad superior al 50 %",
        "More than five homes held above 50%",
        (n) => n > 5,
      ),
    ],
    5,
    article,
    COVERAGE_FROM,
    undefined,
    url,
  );
  add(
    "pais-vasco",
    "ITP",
    `${territory}-habitual25`,
    "Vivienda habitual: superficie/familia y titularidad acreditadas",
    "Main residence: qualifying area/family and ownership",
    flat(2.5),
    [
      territoryReq,
      ...resident,
      deed,
      ownershipReq,
      group("superficie-o-familia-foral", surface, family("numerosa")),
    ],
    20,
    article,
    COVERAGE_FROM,
    undefined,
    url,
  );
  if (territory === "alava")
    add(
      "pais-vasco",
      "ITP",
      "alava-rural15",
      "Vivienda habitual en núcleo alavés en riesgo de despoblación",
      "Main home in an eligible depopulating Álava locality",
      flat(1.5),
      [territoryReq, ...resident, deed, ownershipReq, rural],
      30,
      "NF 11/2003 art. 43.c.3; DA 34 NF 33/2013",
      COVERAGE_FROM,
      undefined,
      url,
    );
}

const storms = requirement(
  "borrascas-2026",
  text(
    "Sustitución por daños irreparables de las borrascas del 23/01 al 16/02/2026",
    "Replacement following irreparable damage from the storms of 23 January–16 February 2026",
  ),
  ["emergencia", "fechaSiniestro"],
  (c) => {
    if (c.input.emergencia !== "borrascas-2026") return false;
    return c.input.fechaSiniestro
      ? c.input.fechaSiniestro >= "2026-01-23" &&
          c.input.fechaSiniestro <= "2026-02-16"
      : "unknown";
  },
);
for (const tax of ["ITP", "AJD"] as const)
  add(
    "andalucia",
    tax,
    "borrascas2026",
    "Sustitución de vivienda habitual por borrascas de 2026",
    "Replacement of main residence following the 2026 storms",
    flat(0),
    [
      ...resident,
      cap(250000),
      storms,
      yes(
        "emergenciaAcreditada",
        "Vivienda dañada dentro del ámbito municipal aprobado por el Consejo de Gobierno (art. 2)",
        "Damaged home within the municipalities/areas approved by the Governing Council (art. 2)",
      ),
      yes(
        "viviendaSustituida",
        "Vivienda dañada identificada en escritura; una sola sustitución por inmueble",
        "Damaged home identified in the deed; only one replacement per damaged property",
      ),
      yes(
        "solicitudRuina",
        "Solicitud municipal de ruina/demolición/inviabilidad de reparación consignada en escritura; beneficio condicionado a resolución favorable",
        "Municipal ruin/demolition/irreparability application recorded in the deed; relief conditional on a favourable decision",
      ),
      deed,
    ],
    50,
    "Decreto-ley 1/2026, arts. 1–4, 8 y 11",
    "2026-01-23",
    "2026-12-31",
    "https://www.juntadeandalucia.es/boja/2026/38/c02/1",
  );

for (const event of ["dana", "campanar"] as const) {
  const eventReq = requirement(
    `supuesto-${event}`,
    text(
      `Supuesto extraordinario declarado: ${event}`,
      `Explicitly declared extraordinary event: ${event}`,
    ),
    ["emergencia"],
    (c) => c.input.emergencia === event,
  );
  const shareReq =
    event === "campanar"
      ? any(
          "titular-inquilino-campanar",
          text(
            "Titularidad anterior acreditada, o arrendatario de vivienda habitual afectada",
            "Previous ownership evidenced, or tenant of an affected main home",
          ),
          numberTest(
            "porcentajeTitularidadSiniestrada",
            "Porcentaje de titularidad del inmueble siniestrado (>0 y ≤100 %)",
            "Ownership share of the damaged property (>0 and ≤100%)",
            (n) => n > 0 && n <= 100,
          ),
          yes(
            "arrendatarioSiniestrado",
            "Arrendatario de la vivienda habitual afectada por el incendio",
            "Tenant of the main home affected by the fire",
          ),
        )
      : numberTest(
          "porcentajeTitularidadSiniestrada",
          "Titularidad del inmueble siniestrado (>0 y ≤100 %)",
          "Ownership share of damaged property (>0 and ≤100%)",
          (n) => n > 0 && n <= 100,
        );
  for (const tax of ["ITP", "AJD"] as const)
    add(
      "comunidad-valenciana",
      tax,
      `emergencia-${event}`,
      `${event === "dana" ? "DANA" : "Campanar"}: bonificación proporcional a titularidad anterior`,
      `${event === "dana" ? "DANA" : "Campanar"}: relief proportional to previous ownership`,
      (c) => {
        const ordinary = applicableRules(
          "comunidad-valenciana",
          tax,
          c.input.fecha,
        )
          .filter(
            (r) =>
              !r.id.includes("emergencia-") &&
              r.requirements.every((q) => q.check(c) === true),
          )
          .sort((a, b) => b.priority - a.priority)[0];
        const underlying =
          typeof ordinary.tariff === "function"
            ? ordinary.tariff(c)
            : ordinary.tariff;
        return quota(
          underlying,
          event === "campanar" && c.input.arrendatarioSiniestrado === true
            ? 100
            : (c.input.porcentajeTitularidadSiniestrada ?? 0),
        );
      },
      [
        eventReq,
        shareReq,
        deed,
        yes(
          "emergenciaAcreditada",
          event === "dana"
            ? "Daño irreparable por DANA de octubre de 2024; inmueble en el ámbito territorial del art. 3 del DL 12/2024"
            : "Propietario de vivienda o arrendatario habitual afectado por el incendio de 22/02/2024, Poeta Rafael Alberti 2, València",
          event === "dana"
            ? "Irreparable damage from the October 2024 DANA; property within DL 12/2024 art. 3 area"
            : "Homeowner or main-home tenant affected by the 22 February 2024 fire at Poeta Rafael Alberti 2, València",
        ),
        yes(
          "viviendaSustituida",
          "Inmueble siniestrado identificado en escritura; beneficio no usado en otra adquisición por el mismo inmueble",
          "Damaged property identified in deed; no other purchase has claimed relief for that same property",
        ),
        ...(event === "campanar"
          ? [
              requirement(
                "no-gran-tenedor-campanar",
                text(
                  "No gran tenedor según art. 3 Ley 12/2023",
                  "Not a large holder under art. 3 Ley 12/2023",
                ),
                ["granTenedor"],
                (c) =>
                  c.input.granTenedor === undefined
                    ? "unknown"
                    : !c.input.granTenedor,
              ),
            ]
          : []),
      ],
      50,
      event === "dana"
        ? "Decreto-ley 12/2024, arts. 3 y 9"
        : "DA 18 Ley 13/1997; Decreto-ley 4/2026, art. 3 (texto BOE)",
      COVERAGE_FROM,
      "2026-12-31",
      event === "dana"
        ? "https://www.boe.es/buscar/doc.php?id=DOGV-r-2024-90200"
        : "https://www.boe.es/buscar/doc.php?id=DOGV-r-2026-90066",
    );
}

// National VAT and acquisition AJD exemption are separate from the lender’s mortgage tax.
for (const [region] of REGIONS.filter(
  ([id]) => !["navarra", "pais-vasco"].includes(id),
)) {
  add(
    region,
    "AJD",
    "vpo-exencion-estatal",
    "Exención de la primera transmisión de VPO con calificación definitiva",
    "Exemption for the first transfer of definitively classified VPO",
    flat(0),
    [
      protectedHome,
      yes(
        "exencionVPO45",
        "Se solicita la exención de la primera transmisión del art. 45.I.B.12.c",
        "Art. 45.I.B.12.c first-transfer exemption is claimed",
      ),
      group(
        "vpo-estatal-equivalente",
        yes(
          "regimenVPOEstatal",
          "Calificación definitiva conforme al régimen estatal de VPO",
          "Definitive classification under the national VPO regime",
        ),
        yes(
          "parametrosVPOEstatal",
          "Protección autonómica: superficie, precio e ingresos no exceden los parámetros estatales de VPO y existe calificación definitiva",
          "Regional protection: area, price and income do not exceed national VPO parameters, with definitive classification",
        ),
      ),
    ],
    1000,
    "art. 45.I.B.12.c y último párrafo",
    COVERAGE_FROM,
    undefined,
    "BOE-A-1993-25359",
  );
  RULES[RULES.length - 1].category = "exemption";
}
const melillaIPSI =
  "https://www.melilla.es/melillaportal/contenedor.jsp?codMenu=764&codMenuPN=601&codMenuSN=1&codMenuTN=182&codbusqueda=801&seccion=s_fdes_d4_v1.jsp";
add(
  "ceuta",
  "IPSI",
  "vivienda",
  "Primera transmisión de inmueble destinado a vivienda",
  "First transfer of property intended as housing",
  flat(0.5),
  [],
  0,
  "Ordenanza IPSI, reforma definitiva aprobada el 29/04/2025 (BOCCE extra 16, 08/05/2025); confirmación oficial de la Ciudad",
  COVERAGE_FROM,
  undefined,
  "https://www.ceuta.es/gobiernodeceuta/index.php/noticia/8-hacienda/13709-la-asamblea-respalda-con-una-amplia-mayoria-el-ambicioso-plan-de-medidas-fiscales",
);
add(
  "melilla",
  "IPSI",
  "general",
  "Primera entrega de vivienda en Melilla",
  "First supply of housing in Melilla",
  flat(4),
  [],
  0,
  "Ordenanza IPSI operaciones interiores; ficha oficial Compra Venta de Bienes Inmuebles, 28/01/2026",
  COVERAGE_FROM,
  undefined,
  melillaIPSI,
);
add(
  "melilla",
  "IPSI",
  "vpo",
  "Primera entrega de VPO por el promotor",
  "First developer supply of officially protected housing",
  flat(0.5),
  [
    protectedHome,
    yes(
      "entregaPromotor",
      "Entrega por el promotor",
      "Supply by the developer",
    ),
  ],
  20,
  "Ordenanza IPSI: primera transmisión de VPO; hasta dos garajes y anexos conjuntos",
  COVERAGE_FROM,
  undefined,
  melillaIPSI,
);
add(
  "estatal",
  "IVA",
  "general",
  "Primera entrega de vivienda: IVA ordinario",
  "First supply of a home: ordinary IVA",
  flat(10),
  [],
  0,
  "arts. 78 y 91.Uno.1.7",
  COVERAGE_FROM,
  undefined,
  "BOE-A-1992-28740",
);
add(
  "estatal",
  "IVA",
  "vpo-especial-publica",
  "VPO especial/promoción pública entregada por el promotor",
  "Special/public-promotion VPO supplied by the developer",
  flat(4),
  [
    group("regimen-iva4", protection("especial"), protection("publica")),
    yes(
      "entregaPromotor",
      "Entrega realizada por el promotor",
      "Supplied by its developer",
    ),
  ],
  20,
  "art. 91.Dos.1.6",
  COVERAGE_FROM,
  undefined,
  "BOE-A-1992-28740",
);
add(
  "canarias",
  "IGIC",
  "general",
  "Primera entrega de vivienda en Canarias",
  "First supply of a home in the Canary Islands",
  flat(7),
  [],
  0,
  "art. 38, DLeg. 1/2025",
);
const canCap = requirement(
  "tope-canario",
  text(
    "Valor ≤200.000 €; familia numerosa general 300.000 €, especial 400.000 €",
    "Value ≤€200,000; certified large family: €300,000 general / €400,000 special",
  ),
  ["familia", "familiaAcreditada"],
  (c) => {
    if (c.valor <= 200000) return true;
    if (!c.input.familia) return "unknown";
    if (!c.input.familia.startsWith("numerosa")) return false;
    if (c.input.familiaAcreditada !== true)
      return c.input.familiaAcreditada ?? "unknown";
    return (
      cents(c.valor) <=
      cents(c.input.familia === "numerosa-especial" ? 400000 : 300000)
    );
  },
);
add(
  "canarias",
  "IGIC",
  "habitual",
  "Vivienda habitual dentro de límites y sin otra vivienda no transmitida",
  "Main residence within limits, with no undisposed previous home",
  flat(5),
  [...resident, canCap, soldOrNone],
  10,
  "art. 38.4",
);
add(
  "canarias",
  "IGIC",
  "colectivos",
  "Tipo reducido por colectivo o renta limitada",
  "Reduced rate for a qualifying group or limited income",
  flat(3),
  [
    ...resident,
    canCap,
    soldOrNone,
    yes(
      "declaracionTransmitente",
      "Declaración al transmitente previa o simultánea a la escritura",
      "Declaration to the seller before or at the deed",
    ),
    group(
      "colectivos-igic",
      age(41),
      family("numerosa"),
      family("monoparental"),
      degree(65),
      violence,
      income(46455, 61770),
    ),
  ],
  20,
  "art. 38.Dos",
);
add(
  "canarias",
  "IGIC",
  "protegida",
  "Vivienda protegida: entrega del promotor que cumple el régimen legal",
  "Protected home supplied by developer under the qualifying regime",
  flat(0),
  [
    group(
      "proteccion-igic0",
      protection("general"),
      protection("especial"),
      all(
        "publica-igic0",
        text(
          "Promoción pública financiada exclusivamente con fondos públicos",
          "Public-promotion home financed exclusively from public funds",
        ),
        protection("publica"),
        yes(
          "financiacionPublica",
          "Financiación pública exclusiva",
          "Exclusively publicly financed",
        ),
      ),
    ),
    yes(
      "entregaPromotor",
      "Entrega por el promotor",
      "Supply by the developer",
    ),
  ],
  30,
  "art. 38.1",
);

const canIncome = requirement(
  "renta-dependientes-can",
  text(
    "Bases IRPF de adquirentes/familia ≤46.455 € +6.825 € por persona con derecho al mínimo familiar, excluido el contribuyente",
    "Buyers/household IRPF bases ≤€46,455 +€6,825 per qualifying family-allowance dependent, excluding taxpayer",
  ),
  ["rentaFamiliar", "dependientes"],
  (c) =>
    known(c.input.rentaFamiliar) && known(c.input.dependientes)
      ? cents(c.input.rentaFamiliar) <=
        cents(46455 + 6825 * c.input.dependientes)
      : "unknown",
);
const canDisability = group(
  "discapacidad-can",
  degree(65),
  all(
    "familiar-discapacidad-can",
    text(
      "Discapacidad familiar ≥65 % con derecho al mínimo familiar",
      "Family-member disability ≥65% qualifying for the family allowance",
    ),
    numberTest(
      "gradoDiscapacidadFamiliar",
      "Discapacidad familiar reconocida ≥65 %",
      "Certified family-member disability ≥65%",
      (n) => n >= 65,
    ),
    yes(
      "nucleoFamiliarAcreditado",
      "Derecho al mínimo familiar por esa persona",
      "Entitled to the family allowance for this person",
    ),
  ),
);
add(
  "canarias",
  "ITP",
  "habitual",
  "Vivienda habitual hasta 200.000 €",
  "Main home up to €200,000",
  flat(5),
  [...resident, cap(200000), soldOrNone],
  10,
  "art. 31",
  COVERAGE_FROM,
  undefined,
  "BOC-j-2009-90008",
);
for (const [id, reqs] of [
  ["numerosa", [family("numerosa"), familyAdjusted(46455, 18200)]],
  ["monoparental", [family("monoparental"), canIncome]],
  ["discapacidad", [canDisability, canIncome]],
] as [string, Requirement[]][]) {
  for (const tax of ["ITP", "AJD"] as const)
    add(
      "canarias",
      tax,
      id,
      `Vivienda habitual: ${id}`,
      `Main home: ${id}`,
      flat(tax === "ITP" ? 1 : 0.4),
      [...resident, soldOrNone, ...reqs],
      20,
      "arts. 32, 33, 33-bis y 37",
      COVERAGE_FROM,
      undefined,
      "BOC-j-2009-90008",
    );
}
for (const tax of ["ITP", "AJD"] as const) {
  add(
    "canarias",
    tax,
    "primera-joven-violencia",
    "Primera vivienda y ningún inmueble previo: joven o víctima",
    "First home, never previously owned property: young buyer or victim",
    tax === "ITP" ? quota(flat(5), 20) : flat(0.4),
    [
      ...resident,
      first,
      cap(200000),
      soldOrNone,
      yes(
        "nuncaTitularInmueble",
        "Nunca titular, nudo propietario ni usufructuario de ningún inmueble",
        "Never owned, held bare ownership or usufruct over any property",
      ),
      group(
        "joven-violencia-can",
        all(
          "joven-renta-can",
          text(
            "Hasta 40 años y renta limitada",
            "Age up to 40 and limited income",
          ),
          age(41),
          canIncome,
        ),
        violence,
      ),
    ],
    15,
    "arts. 35 y 37",
    COVERAGE_FROM,
    undefined,
    "BOC-j-2009-90008",
  );
  add(
    "canarias",
    tax,
    "primera-protegida",
    "Primera vivienda habitual protegida",
    "First protected main home",
    flat(tax === "ITP" ? 0 : 0.4),
    [...resident, first, protectedHome],
    30,
    "arts. 34 y 37",
    COVERAGE_FROM,
    undefined,
    "BOC-j-2009-90008",
  );
}
