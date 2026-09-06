import test from "node:test";
import assert from "node:assert/strict";
import { calculatePurchaseTaxes } from "../src/fiscal/engine";
import { mapCase } from "../scripts/itp-map/case";
import type { Purchase, Tax } from "../src/fiscal/types";
const p = (r: string, x: Partial<Purchase> = {}): Purchase => ({
  ...mapCase(r),
  ...x,
});
const tax = (v: Purchase, t: Tax = "ITP") =>
  calculatePurchaseTaxes(v).lines.find((l) => l.tax === t)?.amount;

test("All 19 ordinary purchase AJD rates, separate from IVA/IGIC/IPSI", () => {
  const expected: Record<string, number> = {
    andalucia: 2400,
    aragon: 3000,
    asturias: 2400,
    baleares: 3000,
    canarias: 2000,
    cantabria: 3000,
    "castilla-la-mancha": 3000,
    "castilla-y-leon": 3000,
    cataluna: 3000,
    "comunidad-valenciana": 2800,
    extremadura: 3000,
    galicia: 3000,
    madrid: 1500,
    murcia: 3000,
    navarra: 1000,
    "pais-vasco": 1000,
    "la-rioja": 2000,
    ceuta: 500,
    melilla: 500,
  };
  for (const [region, amount] of Object.entries(expected))
    assert.equal(
      tax(p(region, { tipoVivienda: "Obra nueva", habitual: false }), "AJD"),
      amount,
      region,
    );
});
test("Galicia two/three-person household: exact price and assets boundary + one cent", () => {
  for (const [members, limit] of [
    [2, 270000],
    [3, 300000],
  ]) {
    const v = p("galicia", {
      precio: limit,
      valorMercado: limit,
      valorDeclarado: limit,
      miembrosFamilia: members,
      patrimonio: limit,
      familia: "monoparental-general",
      familiaAcreditada: true,
    });
    assert.equal(tax(v), limit * 0.03);
    assert.equal(
      tax({
        ...v,
        precio: limit + 0.01,
        valorDeclarado: limit + 0.01,
        valorMercado: limit + 0.01,
      }),
      Math.round((limit + 0.01) * 8) / 100,
    );
    assert.equal(tax({ ...v, patrimonio: limit + 0.01 }), limit * 0.08);
    assert.equal(
      tax(
        {
          ...v,
          zona: "rural",
          municipio: "Parroquia oficial",
          zonaOficialConfirmada: true,
          tipoVivienda: "Obra nueva",
        },
        "AJD",
      ),
      0,
    );
  }
});
test("Baleares island changes in March and June; prior family ceiling", () => {
  const v = p("baleares", {
    precio: 300000,
    valorMercado: 300000,
    valorDeclarado: 300000,
  });
  assert.equal(tax({ ...v, fecha: "2026-02-28" }), 24000);
  assert.equal(tax({ ...v, fecha: "2026-03-01" }), 13193.95);
  assert.equal(tax({ ...v, isla: "menorca", fecha: "2026-06-13" }), 24000);
  assert.equal(tax({ ...v, isla: "menorca", fecha: "2026-06-14" }), 13193.95);
  assert.equal(
    tax({
      ...v,
      isla: "menorca",
      fecha: "2026-06-13",
      familia: "numerosa-general",
      familiaAcreditada: true,
      progenitorConviviente: true,
    }),
    7790.92,
  );
});
test("VPO exemption is explicitly evidenced, separate from IVA 4%", () => {
  const v = p("madrid", {
    tipoVivienda: "Obra nueva",
    proteccion: "general",
    calificacionVigente: true,
    entregaPromotor: true,
    exencionVPO45: true,
    regimenVPOEstatal: true,
  });
  assert.equal(tax(v, "AJD"), 0);
  assert.equal(tax(v, "IVA"), 20000);
  assert.notEqual(tax({ ...v, regimenVPOEstatal: undefined }, "AJD"), 0);
  assert.equal(
    tax(
      { ...v, regimenVPOEstatal: undefined, parametrosVPOEstatal: true },
      "AJD",
    ),
    0,
  );
});
test("Extremadura historical protected 4%, new income cap, bank-payment proof", () => {
  const v = p("extremadura", {
    proteccion: "precio-maximo",
    calificacionVigente: true,
    renta: 55001,
    irpfModo: "conjunta",
  });
  assert.equal(tax({ ...v, fecha: "2026-08-04" }), 8000);
  assert.equal(tax({ ...v, fecha: "2026-08-05" }), 16000);
  assert.equal(tax({ ...v, renta: 10000, pagoBancario: undefined }), 16000);
});
test("Aragón rebates stack only as expressly permitted; whole and marginal scales differ", () => {
  const v = p("aragon", {
    precio: 100000,
    valorDeclarado: 100000,
    valorMercado: 100000,
    edad: 30,
    gradoDiscapacidad: 65,
    violenciaAcreditada: true,
  });
  assert.equal(tax(v), 5000); // 8000 less three compatible 12.5% rebates
  assert.equal(tax({ ...v, violenciaAcreditada: false }), 6000);
  const high = p("asturias", {
    precio: 500000.01,
    valorDeclarado: 500000.01,
    valorMercado: 500000.01,
    habitual: false,
  });
  assert.equal(tax(high), 50000);
  assert.equal(tax({ ...high, comunidad: "extremadura" }), 42800);
});
test("Cataluña family disability and single-parent-specific income minimum", () => {
  const v = p("cataluna", {
    gradoDiscapacidadFamiliar: 65,
    nucleoFamiliarAcreditado: true,
    rentaFamiliar: 36000,
  });
  assert.equal(tax(v), 10000);
  assert.equal(tax({ ...v, nucleoFamiliarAcreditado: undefined }), 20000);
  const mono = p("cataluna", {
    familia: "monoparental-general",
    familiaAcreditada: true,
    hijos: 3,
    hijosMinimosMonoparentalEspecial: 2,
    rentaFamiliar: 50000,
  });
  assert.equal(tax(mono), 10000);
  assert.equal(tax({ ...mono, rentaFamiliar: 50000.01 }), 20000);
});
test("Foral property ownership and territory-specific area", () => {
  for (const territorioForal of ["alava", "bizkaia", "gipuzkoa"] as const) {
    const v = p("pais-vasco", {
      territorioForal,
      superficieConstruida: 120,
      superficieUtil: 96,
    });
    assert.equal(tax(v), 5000);
    assert.equal(tax({ ...v, otraViviendaMunicipioPorcentaje: 25.01 }), 8000);
    assert.equal(tax({ ...v, numeroViviendas: 6, habitual: false }), 12000);
  }
  assert.equal(tax(p("navarra", { hijos: 2 })), 10196.96);
});
test("Navarra rural designation and full title cannot be inferred", () => {
  const v = p("navarra", {
    zona: "rural",
    municipio: "Municipio incluido en orden foral",
    zonaOficialConfirmada: true,
  });
  assert.equal(tax(v), 8000);
  assert.equal(tax({ ...v, zonaOficialConfirmada: undefined }), 12000);
  assert.equal(tax({ ...v, plenoDominioSinConsolidacion: undefined }), 12000);
  assert.equal(tax({ ...v, plenoDominioSinConsolidacion: false }), 12000);
});
test("Baleares family relief needs a cohabiting parent; Cantabria deed is explicit", () => {
  const v = p("baleares", {
    familia: "numerosa-general",
    familiaAcreditada: true,
    progenitorConviviente: true,
  });
  assert.equal(tax(v), 4000);
  assert.equal(tax({ ...v, progenitorConviviente: undefined }), 8000);
  assert.equal(tax(p("cantabria", { escrituraBeneficio: undefined })), 18000);
});
test("Extraordinary relief requires explicit event, evidence, ownership and dates", () => {
  const v = p("andalucia", {
    emergencia: "borrascas-2026",
    fechaSiniestro: "2026-02-01",
    emergenciaAcreditada: true,
    solicitudRuina: true,
    viviendaSustituida: true,
  });
  assert.equal(tax(v), 0);
  assert.equal(tax({ ...v, fechaSiniestro: "2026-02-17" }), 14000);
  assert.equal(tax({ ...v, solicitudRuina: undefined }), 14000);
  for (const emergencia of ["dana", "campanar"] as const) {
    const cv = p("comunidad-valenciana", {
      emergencia,
      emergenciaAcreditada: true,
      viviendaSustituida: true,
      porcentajeTitularidadSiniestrada: 50,
    });
    assert.equal(tax(cv), 9000);
    assert.equal(tax({ ...cv, emergencia: "ninguna" }), 18000);
    assert.equal(tax({ ...cv, emergenciaAcreditada: undefined }), 18000);
  }
});
