import test from "node:test";
import assert from "node:assert/strict";
import { RULES, applicableRules } from "../src/fiscal/rules";
import { assess } from "../src/fiscal/tariffs";
import { mapCase, mapData } from "../scripts/itp-map/case";
import type { Context, Purchase } from "../src/fiscal/types";

// Positive eligibility fixtures exercise every registered rule, including historical
// and AJD variants. Numeric integration expectations live in fiscal.test.ts.
function fixture(id: string, region: string, date: string): Purchase {
  const input: Purchase = {
    ...mapCase(region),
    precio: 100000,
    valorMercado: 100000,
    valorDeclarado: 100000,
    fecha: date,
    edad: 25,
    gradoDiscapacidad: 65,
    gradoDiscapacidadFamiliar: 65,
    nucleoFamiliarAcreditado: true,
    familia: "numerosa-general",
    familiaAcreditada: true,
    progenitorConviviente: true,
    plenoDominioSinConsolidacion: true,
    miembrosFamilia: 5,
    miembrosMinimosNumerosa: 5,
    hijos: 3,
    hijosMinimosNumerosa: 3,
    hijosMinimosMonoparentalEspecial: 2,
    renta: 10000,
    rentaFamiliar: 10000,
    rentaAhorro: 0,
    patrimonio: 100000,
    hipoteca: 80000,
    tasacion: 100000,
    residenciaBaleares: 3,
    municipio: "Localidad verificada en lista oficial (fixture)",
    zona: "rural",
    zonaOficialConfirmada: true,
    ventaAnterior: true,
    proteccion: "general",
    calificacionVigente: true,
    entregaPromotor: true,
    financiacionPublica: true,
    ayudaPublicaAdquisicion: true,
    exencionVPO45: true,
    regimenVPOEstatal: true,
    violenciaAcreditada: true,
    terrorismoAcreditado: true,
    cambioDomicilioViolencia: true,
    residenciaRuralPlazos: true,
    hijosEscolarizadosRural: true,
    ruralAtencionEspecial: id.endsWith("-3"),
    rehabilitacion: true,
    construccionAnterior1970: true,
    rehabilitacionEstructural: true,
    costeRehabilitacion: 30000,
    valorSinSuelo: 80000,
    rehabilitacionPlazos: true,
    fechaTituloFamilia: "2025-06-01",
    superficieUtil: 80,
    superficieConstruida: 100,
    dependientes: 3,
    nuncaTitularInmueble: true,
    declaracionTransmitente: true,
    emergenciaAcreditada: true,
    solicitudRuina: true,
    viviendaSustituida: true,
    porcentajeTitularidadSiniestrada: 100,
    fechaSiniestro: "2026-01-25",
    exclusionGranTenedor: false,
  };
  if (id.includes("monoparental")) input.familia = "monoparental-general";
  if (
    id.includes("protegida-anterior") ||
    (id.includes("extremadura") && id.endsWith("protegida"))
  )
    input.proteccion = "precio-maximo";
  if (id.includes("especial") || id.includes("especial-publica"))
    input.proteccion = "especial";
  if (id.includes("vpl50")) input.proteccion = "vpl";
  for (const zone of ["riesgo", "intensa", "extrema"] as const)
    if (id.includes("rural-" + zone)) input.zona = zone;
  if (id.includes("gran-tenedor") || id.endsWith("agravado"))
    input.granTenedor = true;
  if (id.includes("titular6")) input.numeroViviendas = 6;
  for (const territory of ["alava", "bizkaia", "gipuzkoa"] as const)
    if (id.includes(territory)) input.territorioForal = territory;
  if (id.includes("borrascas")) input.emergencia = "borrascas-2026";
  if (id.endsWith("emergencia-dana")) input.emergencia = "dana";
  if (id.endsWith("emergencia-campanar")) input.emergencia = "campanar";
  return input;
}

for (const rule of RULES)
  test("rule contract: " + rule.id, () => {
    const input = fixture(rule.id, rule.comunidad, rule.effectiveFrom);
    const c: Context = {
      input,
      base: input.precio,
      valor: input.precio,
      share: 1,
      allBuyers: [input],
    };
    for (const req of rule.requirements) {
      assert.equal(
        req.check(c),
        true,
        rule.id + " / " + req.id + " positive fixture",
      );
      if (!req.fields.length) continue; // value-only ceilings are tested at numeric boundaries.
      const missing = { ...input };
      for (const field of req.fields)
        delete (missing as Partial<Purchase>)[field];
      // Below €200k the Canary cap needs no family category. Exercise the
      // family-dependent higher ceiling when testing missing certification.
      const wiped: Context = {
        ...c,
        input: missing,
        valor: req.id === "tope-canario" ? 300000 : c.valor,
        share: req.fields.includes("porcentaje") ? 0 : c.share,
      };
      assert.notEqual(
        req.check(wiped),
        true,
        rule.id + " / " + req.id + " missing answers must not qualify",
      );
    }
    const tariff =
      typeof rule.tariff === "function" ? rule.tariff(c) : rule.tariff;
    const bill = assess(tariff, c.base);
    assert.ok(Number.isFinite(bill.amount) && bill.amount >= 0, rule.id);
    assert.equal(
      Math.round(bill.steps.reduce((sum, s) => sum + s.amount, 0) * 100),
      Math.round(bill.amount * 100),
    );
    assert.ok(
      applicableRules(
        rule.comunidad,
        rule.impuesto,
        rule.effectiveFrom,
      ).includes(rule),
    );
    const before = new Date(Date.parse(rule.effectiveFrom) - 86400000)
      .toISOString()
      .slice(0, 10);
    assert.ok(
      !applicableRules(rule.comunidad, rule.impuesto, before).includes(rule),
    );
    if (rule.effectiveTo) {
      assert.ok(
        applicableRules(
          rule.comunidad,
          rule.impuesto,
          rule.effectiveTo,
        ).includes(rule),
      );
      const after = new Date(Date.parse(rule.effectiveTo) + 86400000)
        .toISOString()
        .slice(0, 10);
      assert.ok(
        !applicableRules(rule.comunidad, rule.impuesto, after).includes(rule),
      );
    }
  });
test("Maps consume the same motor, including each foral territory", () => {
  const data = mapData();
  assert.equal(Object.keys(data.rows).length, 21);
  assert.equal(data.rows.madrid.amount, 10800);
  assert.equal(data.rows["castilla-la-mancha"].amount, 12000);
  assert.equal(data.rows.baleares.amount, 8000);
  assert.equal(data.rows.galicia.amount, 14000);
});
