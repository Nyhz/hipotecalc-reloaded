import test from "node:test";
import "./rules-contract.test";
import "./integration-cases.test";
import assert from "node:assert/strict";
import { calculatePurchaseTaxes, defaultPurchase } from "../src/fiscal/engine";
import { RULES } from "../src/fiscal/rules";
import { REGIONS, REVIEWED } from "../src/fiscal/sources";
import { assess, bands } from "../src/fiscal/tariffs";
import type { Purchase, Tax } from "../src/fiscal/types";

const home = (
  region: string,
  price = 200000,
  extra: Partial<Purchase> = {},
): Purchase => ({
  ...defaultPurchase(price, region),
  referenciaExiste: false,
  valorMercado: price,
  habitual: true,
  ocupacionMantenimiento: true,
  escrituraBeneficio: true,
  pagoBancario: true,
  primera: false,
  familia: "ninguna",
  gradoDiscapacidad: 0,
  gradoDiscapacidadFamiliar: 0,
  violenciaAcreditada: false,
  terrorismoAcreditado: false,
  zona: "normal",
  ...extra,
});
const amount = (p: Purchase, tax: Tax = "ITP") =>
  calculatePurchaseTaxes(p).lines.find((l) => l.tax === tax)?.amount;
const id = (p: Purchase, tax: Tax = "ITP") =>
  calculatePurchaseTaxes(p).lines.find((l) => l.tax === tax)?.rules[0]?.id;

test("Tariff arithmetic distinguishes marginal and whole-value scales", () => {
  assert.equal(
    assess(
      bands("progressive", [
        [300000, 7],
        [null, 9],
      ]),
      350000,
    ).amount,
    25500,
  );
  assert.equal(
    assess(
      bands("whole-value", [
        [300000, 7],
        [null, 9],
      ]),
      350000,
    ).amount,
    31500,
  );
  const tariff = {
    ...bands("progressive", [
      [400000, 8],
      [600000, 9],
      [null, 10],
    ]),
    meanRounding: "balear",
  } as const;
  assert.equal(assess(tariff, 500000).amount, 41000);
});

test("19 regions: ordinary resale rates, no phantom relief", () => {
  const expected: Record<string, number> = {
    andalucia: 14000,
    aragon: 16000,
    asturias: 16000,
    baleares: 16000,
    canarias: 13000,
    cantabria: 18000,
    "castilla-la-mancha": 18000,
    "castilla-y-leon": 16000,
    cataluna: 20000,
    "comunidad-valenciana": 18000,
    extremadura: 16000,
    galicia: 16000,
    madrid: 12000,
    murcia: 15500,
    navarra: 12000,
    "pais-vasco": 8000,
    "la-rioja": 14000,
    ceuta: 6000,
    melilla: 6000,
  };
  for (const [region] of REGIONS)
    assert.equal(
      amount(home(region, 200000, { habitual: false })),
      expected[region],
      region,
    );
});
test("reference base vs IVA consideration; missing input is not zero", () => {
  const p = home("madrid", 200000, {
    habitual: false,
    referenciaExiste: true,
    valorReferencia: 250000,
  });
  assert.equal(amount(p), 15000);
  assert.equal(amount({ ...p, tipoVivienda: "Obra nueva" }, "IVA"), 20000);
  assert.equal(amount({ ...p, tipoVivienda: "Obra nueva" }, "AJD"), 1875);
  assert.equal(
    calculatePurchaseTaxes({ ...p, valorReferencia: undefined }).total,
    null,
  );
  assert.equal(calculatePurchaseTaxes({ ...p, comunidad: "" }).total, null);
});
test("Madrid general, main-home rebate and strict under-35 rural age", () => {
  assert.equal(amount(home("madrid", 200000, { habitual: false })), 12000);
  assert.equal(amount(home("madrid")), 10800);
  const rural = home("madrid", 200000, {
    edad: 34,
    zona: "rural",
    municipio: "Municipio oficial <2500",
    zonaOficialConfirmada: true,
  });
  assert.equal(amount(rural), 0);
  assert.equal(amount({ ...rural, edad: 35 }), 10800);
  assert.equal(amount({ ...rural, zonaOficialConfirmada: undefined }), 10800);
});
test("Cantabria progressive main-home cap and disability degrees", () => {
  assert.equal(amount(home("cantabria", 350000)), 25500);
  assert.equal(
    amount(home("cantabria", 200000, { gradoDiscapacidad: 50 })),
    8000,
  );
  assert.equal(
    amount(home("cantabria", 200000, { gradoDiscapacidad: 65 })),
    6000,
  );
  assert.equal(
    amount(home("cantabria", 350000, { gradoDiscapacidad: 65 })),
    13500,
  );
  assert.equal(
    amount(home("cantabria", 350000, { fecha: "2026-04-30" })),
    31500,
  );
  assert.equal(
    amount(home("cantabria", 350000, { fecha: "2026-05-01" })),
    25500,
  );
  assert.equal(amount(home("cantabria", 200000, { edad: 39 })), 8000);
  assert.equal(amount(home("cantabria", 200000, { edad: 40 })), 14000);
});
const clm = home("castilla-la-mancha", 200000, {
  primera: true,
  edad: 35,
  valorDeclarado: 200000,
  hipoteca: 100000.01,
  tasacion: 200000,
  entidadCredito: true,
  hipotecaSobreInmueble: true,
});
test("CLM mortgage >50%, never >=50%; valuation proof mandatory", () => {
  assert.equal(amount(clm), 6000);
  assert.equal(amount({ ...clm, hipoteca: 100000 }), 18000);
  assert.equal(amount({ ...clm, hipoteca: undefined }), 18000);
  assert.equal(amount({ ...clm, tasacion: undefined }), 18000);
  assert.equal(
    amount({
      ...clm,
      referenciaExiste: true,
      valorReferencia: 200000,
      valorDeclarado: 199999,
    }),
    18000,
  );
  assert.equal(
    amount({
      ...clm,
      referenciaExiste: true,
      valorReferencia: 200000,
      tasacion: undefined,
    }),
    6000,
  );
});
test("CLM date switch; cap and age; rural categories; acquisition AJD", () => {
  assert.equal(amount({ ...clm, fecha: "2026-03-30" }), 18000);
  assert.equal(amount({ ...clm, fecha: "2026-03-31" }), 6000);
  for (const [zona, rate, ajd] of [
    ["riesgo", 5, 0.5],
    ["intensa", 4, 0.25],
    ["extrema", 3, 0.15],
  ] as const) {
    const p = {
      ...clm,
      edad: 45,
      zona,
      municipio: "Municipio clasificado oficialmente",
      zonaOficialConfirmada: true,
    };
    assert.equal(amount(p), (200000 * rate) / 100, zona);
    assert.equal(
      amount({ ...p, tipoVivienda: "Obra nueva" }, "AJD"),
      (200000 * ajd) / 100,
      zona,
    );
    assert.equal(amount({ ...p, zonaOficialConfirmada: false }), 12000);
  }
  assert.equal(amount({ ...clm, tipoVivienda: "Obra nueva" }, "AJD"), 500);
  assert.equal(amount({ ...clm, edad: 36 }), 12000);
});
test("CV >€1m uses 11% on whole base; June switch", () => {
  assert.equal(
    amount(home("comunidad-valenciana", 1200000, { habitual: false })),
    132000,
  );
  assert.equal(
    amount(home("comunidad-valenciana", 1000000, { habitual: false })),
    90000,
  );
  assert.equal(
    amount(
      home("comunidad-valenciana", 200000, {
        fecha: "2026-05-31",
        habitual: false,
      }),
    ),
    20000,
  );
  assert.equal(
    amount(
      home("comunidad-valenciana", 200000, {
        fecha: "2026-06-01",
        habitual: false,
      }),
    ),
    18000,
  );
});
test("CV new home: IVA and acquisition AJD separated", () => {
  const p = home("comunidad-valenciana", 300000, {
    tipoVivienda: "Obra nueva",
  });
  assert.equal(amount(p, "ITP"), 0);
  assert.equal(amount(p, "IVA"), 30000);
  assert.equal(amount(p, "AJD"), 300);
  assert.equal(calculatePurchaseTaxes(p).total, 30300);
  assert.equal(calculatePurchaseTaxes({ ...p, habitual: false }).total, 34200);
  assert.equal(
    calculatePurchaseTaxes({ ...p, habitual: false, fecha: "2026-05-31" })
      .total,
    34500,
  );
});
test("CV young income, family categories and disability type thresholds", () => {
  const p = home("comunidad-valenciana", 180000, {
    primera: true,
    edad: 34,
    irpfModo: "individual",
    renta: 30000,
  });
  assert.equal(amount(p), 10800);
  assert.equal(amount({ ...p, renta: 30000.01 }), 16200);
  assert.equal(amount({ ...p, irpfModo: undefined }), 16200);
  assert.equal(
    amount({ ...p, precio: 180001, valorMercado: 180001 }),
    14400.08,
  );
  assert.equal(amount({ ...p, edad: 40, gradoDiscapacidad: 40 }), 16200);
  assert.equal(
    amount({
      ...p,
      edad: 40,
      gradoDiscapacidad: 40,
      tipoDiscapacidad: "intelectual-mental",
      discapacidadPermanente: true,
    }),
    5400,
  );
  assert.equal(amount({ ...p, edad: 40, gradoDiscapacidad: 65 }), 5400);
  assert.equal(
    amount({
      ...p,
      edad: 40,
      familia: "numerosa-especial",
      familiaAcreditada: true,
      renta: 35000,
    }),
    5400,
  );
  assert.equal(
    amount({
      ...p,
      edad: 40,
      familia: "numerosa-especial",
      familiaAcreditada: true,
      renta: 35000.01,
    }),
    16200,
  );
});
test("IVA 4% is NOT generic VPO; developer and exact regime mandatory", () => {
  const p = home("comunidad-valenciana", 200000, {
    tipoVivienda: "Obra nueva",
  });
  assert.equal(amount(p, "IVA"), 20000);
  assert.equal(
    amount(
      {
        ...p,
        proteccion: "general",
        calificacionVigente: true,
        entregaPromotor: true,
      },
      "IVA",
    ),
    20000,
  );
  assert.equal(
    amount(
      { ...p, proteccion: "sin-clasificar", calificacionVigente: true },
      "IVA",
    ),
    20000,
  );
  for (const proteccion of ["especial", "publica"] as const) {
    assert.equal(
      amount(
        { ...p, proteccion, calificacionVigente: true, entregaPromotor: true },
        "IVA",
      ),
      8000,
    );
    assert.equal(
      amount(
        {
          ...p,
          proteccion,
          calificacionVigente: true,
          entregaPromotor: undefined,
        },
        "IVA",
      ),
      20000,
    );
  }
});
const bal = home("baleares", 300000, {
  isla: "eivissa",
  primera: true,
  edad: 29,
  porcentaje: 100,
  otraViviendaPorcentaje: 0,
  residenciaBaleares: 3,
  irpfModo: "individual",
  renta: 52800,
  hipoteca: 180000,
  tasacion: 300000,
  entidadCredito: true,
  hipotecaSobreInmueble: true,
});
test("Baleares exact island ceilings and partial relief", () => {
  const p = { ...bal, edad: 50 };
  assert.equal(amount(p), 13193.95);
  assert.equal(
    id({ ...p, precio: 378211.68, valorMercado: 378211.68 }),
    "baleares-itp-habitual-parcial",
  );
  assert.equal(
    id({ ...p, precio: 378211.69, valorMercado: 378211.69 }),
    "baleares-itp-general",
  );
  assert.equal(
    id({ ...p, isla: "mallorca", precio: 331859.7, valorMercado: 331859.7 }),
    "baleares-itp-habitual-parcial",
  );
  assert.equal(
    id({ ...p, isla: "mallorca", precio: 331859.71, valorMercado: 331859.71 }),
    "baleares-itp-general",
  );
  assert.equal(id({ ...p, isla: undefined }), "baleares-itp-general");
});
test("Baleares 100% only on first slice; every disqualifier independently tested", () => {
  assert.equal(amount(bal), 2387.9);
  for (const patch of [
    { residenciaBaleares: 2.99 },
    { hipoteca: 179999.99 },
    { renta: 52800.01 },
    { porcentaje: 49.99 },
    { porcentaje: undefined },
    { otraViviendaPorcentaje: 50 },
    { irpfModo: undefined },
    { entidadCredito: undefined },
    { primera: undefined },
    { ocupacionMantenimiento: undefined },
  ])
    assert.notEqual(
      id({ ...bal, ...patch }),
      "baleares-itp-bonificacion100-parcial",
      JSON.stringify(patch),
    );
  assert.equal(
    id({ ...bal, porcentaje: 50 }),
    "baleares-itp-bonificacion100-parcial",
  );
  assert.equal(
    id({ ...bal, edad: 50, gradoDiscapacidad: 33 }),
    "baleares-itp-bonificacion100-parcial",
  );
});
test("Baleares VPL date, AJD partial rates and >=€1m 2%", () => {
  const p = home("baleares", 200000, {
    habitual: false,
    proteccion: "vpl",
    calificacionVigente: true,
  });
  assert.equal(amount({ ...p, fecha: "2026-06-13" }), 16000);
  assert.equal(amount({ ...p, fecha: "2026-06-14" }), 8000);
  assert.equal(amount({ ...p, tipoVivienda: "Obra nueva" }, "AJD"), 1500);
  assert.equal(
    amount(
      home("baleares", 1000000, {
        tipoVivienda: "Obra nueva",
        habitual: false,
      }),
      "AJD",
    ),
    20000,
  );
  assert.equal(
    amount({ ...bal, edad: 50, tipoVivienda: "Obra nueva" }, "AJD"),
    3149.24,
  );
});
test("Extremadura individual/joint cent boundaries and no blank-income benefit", () => {
  for (const [irpfModo, limit] of [
    ["individual", 30000],
    ["conjunta", 55000],
  ] as const) {
    const p = home("extremadura", 200000, { edad: 35, irpfModo, renta: limit });
    assert.equal(amount(p), 8000);
    assert.equal(amount({ ...p, renta: limit + 0.01 }), 16000);
    assert.equal(amount({ ...p, renta: undefined }), 16000);
    assert.equal(amount({ ...p, edad: 45 }), 14000);
    assert.equal(
      amount({ ...p, edad: 45, tipoVivienda: "Obra nueva" }, "AJD"),
      1000,
    );
    assert.equal(
      amount(
        {
          ...p,
          tipoVivienda: "Obra nueva",
          proteccion: "precio-maximo",
          calificacionVigente: true,
        },
        "AJD",
      ),
      200,
    );
  }
});
test("Extremadura rural reform date and prior aggregate-income requirement", () => {
  const p = home("extremadura", 200000, {
    edad: 50,
    zona: "rural",
    municipio: "Municipio <3000",
    zonaOficialConfirmada: true,
    irpfModo: "individual",
    renta: 30000,
  });
  assert.equal(amount({ ...p, fecha: "2026-08-04" }), 14000);
  assert.equal(amount({ ...p, fecha: "2026-08-05" }), 8000);
  assert.equal(amount({ ...p, gradoDiscapacidad: 33, zona: "normal" }), 14000);
  assert.equal(amount({ ...p, gradoDiscapacidad: 65, zona: "normal" }), 8000);
});
test("Galicia family-size formula, patrimony, independent buyers and rural deduction", () => {
  const p = home("galicia", 300000, {
    familia: "monoparental-general",
    familiaAcreditada: true,
    miembrosFamilia: 3,
    patrimonio: 300000,
  });
  assert.equal(amount(p), 9000);
  assert.equal(amount({ ...p, patrimonio: 300000.01 }), 24000);
  assert.equal(amount({ ...p, miembrosFamilia: undefined }), 24000);
  assert.equal(amount({ ...p, tipoVivienda: "Obra nueva" }, "AJD"), 1500);
  assert.equal(
    amount({
      ...p,
      zona: "rural",
      municipio: "Parroquia oficialmente clasificada",
      zonaOficialConfirmada: true,
    }),
    0,
  );
  const mixed = {
    ...p,
    adquirentes: [
      {
        porcentaje: 50,
        habitual: true,
        familia: "monoparental-general" as const,
        familiaAcreditada: true,
        miembrosFamilia: 3,
        patrimonio: 300000,
      },
      { porcentaje: 50, habitual: false, familia: "ninguna" as const },
    ],
  };
  assert.equal(amount(mixed), 16500);
  assert.equal(
    amount({
      ...p,
      familia: "numerosa-general",
      miembrosFamilia: 5,
      miembrosMinimosNumerosa: 5,
      precio: 400000,
      valorMercado: 400000,
      patrimonio: 400000,
    }),
    12000,
  );
});
test("Andalucía family disability is not a generic boolean", () => {
  const p = home("andalucia", 200000, {
    gradoDiscapacidadFamiliar: 33,
    nucleoFamiliarAcreditado: true,
  });
  assert.equal(amount(p), 7000);
  assert.equal(amount({ ...p, nucleoFamiliarAcreditado: undefined }), 14000);
  assert.equal(amount({ ...p, gradoDiscapacidadFamiliar: 32 }), 14000);
  assert.equal(amount(home("andalucia", 150000)), 9000);
  assert.equal(amount(home("andalucia", 150000.01)), 10500);
});
test("Asturias whole-value tariff and official rural confirmation", () => {
  assert.equal(amount(home("asturias", 400000, { habitual: false })), 36000);
  assert.equal(amount(home("asturias", 200000, { edad: 35 })), 12000);
  assert.equal(amount(home("asturias", 200000, { edad: 36 })), 16000);
  const p = home("asturias", 150000, {
    zona: "rural",
    municipio: "Concejo Decreto 83/2025",
    zonaOficialConfirmada: true,
  });
  assert.equal(amount(p), 6000);
  assert.equal(amount({ ...p, zonaOficialConfirmada: undefined }), 12000);
  assert.equal(
    amount({ ...p, granTenedor: true, exclusionGranTenedor: false }),
    30000,
  );
});
test("Canarias uses IGIC, not IVA, and purchase AJD is 1% ordinarily", () => {
  const p = home("canarias", 250000, {
    tipoVivienda: "Obra nueva",
    habitual: false,
  });
  assert.equal(amount(p, "IGIC"), 17500);
  assert.equal(amount(p, "IVA"), undefined);
  assert.equal(amount(p, "AJD"), 2500);
  assert.equal(calculatePurchaseTaxes(p).total, 20000);
  const protectedP = {
    ...p,
    proteccion: "general" as const,
    calificacionVigente: true,
    entregaPromotor: true,
  };
  assert.equal(amount(protectedP, "IGIC"), 0);
});
test("Ceuta first housing transfer: 2025 IPSI reform, not stale 4% or IVA", () => {
  const result = calculatePurchaseTaxes(
    home("ceuta", 200000, { tipoVivienda: "Obra nueva" }),
  );
  assert.equal(result.total, 1500);
  assert.equal(result.lines.find((l) => l.tax === "IPSI")?.amount, 1000);
  assert.equal(
    result.lines.some((l) => l.tax === "IVA"),
    false,
  );
});
test("Melilla official first-delivery IPSI and protected-housing rate", () => {
  const p = home("melilla", 200000, { tipoVivienda: "Obra nueva" });
  assert.equal(amount(p, "IPSI"), 8000);
  assert.equal(amount(p, "AJD"), 500);
  assert.equal(calculatePurchaseTaxes(p).total, 8500);
  assert.equal(
    amount(
      {
        ...p,
        proteccion: "general",
        calificacionVigente: true,
        entregaPromotor: true,
      },
      "IPSI",
    ),
    1000,
  );
});
test("Sensitivity must re-evaluate tax, not scale a modal amount", () => {
  const p = home("cantabria", 300000);
  assert.equal(amount(p), 21000);
  assert.equal(amount({ ...p, precio: 350000, valorMercado: 350000 }), 25500);
  assert.notEqual(
    amount({ ...p, precio: 350000, valorMercado: 350000 }),
    (21000 * 350000) / 300000,
  );
});
test("All rules have auditable metadata and valid date intervals", () => {
  assert.equal(new Set(RULES.map((r) => r.id)).size, RULES.length);
  for (const r of RULES) {
    assert.ok(r.id && r.title.es && r.title.en && r.group, r.id);
    assert.ok(
      r.source.url.startsWith("https://") &&
        r.source.article &&
        r.source.checked === REVIEWED,
      r.id,
    );
    assert.ok(!r.effectiveTo || r.effectiveFrom <= r.effectiveTo, r.id);
    for (const req of r.requirements)
      assert.ok(req.label.es && req.label.en && req.id, r.id);
  }
});
test("Invalid dates, nonfinite inputs, invalid shares and unsupported history do not calculate", () => {
  for (const patch of [
    { precio: NaN },
    { precio: -1 },
    { fecha: "2026-02-30" },
    { fecha: "2025-12-31" },
    { porcentaje: 101 },
    { adquirentes: [{ porcentaje: 70 }, { porcentaje: 40 }] },
  ])
    assert.equal(
      calculatePurchaseTaxes({ ...home("madrid"), ...patch }).total,
      null,
    );
});
