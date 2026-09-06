import {
  calculatePurchaseTaxes,
  defaultPurchase,
} from "../../src/fiscal/engine";
import { REGIONS, REVIEWED } from "../../src/fiscal/sources";
import type { Purchase } from "../../src/fiscal/types";

/** Illustration only: explicit shared assumptions, never a second tariff table. */
export function mapCase(
  region: string,
  territory?: Purchase["territorioForal"],
): Purchase {
  return {
    ...defaultPurchase(200000, region),
    habitual: true,
    primera: true,
    edad: 41,
    porcentaje: 100,
    referenciaExiste: false,
    valorMercado: 200000,
    valorDeclarado: 200000,
    valorForal: 200000,
    territorioForal: territory,
    ocupacionMantenimiento: true,
    escrituraBeneficio: true,
    plenoDominioSinConsolidacion: true,
    pagoBancario: true,
    hipoteca: 160000,
    tasacion: 200000,
    hipotecaSobreInmueble: true,
    entidadCredito: true,
    familia: "ninguna",
    gradoDiscapacidad: 0,
    gradoDiscapacidadFamiliar: 0,
    violenciaAcreditada: false,
    terrorismoAcreditado: false,
    zona: "normal",
    isla: "mallorca",
    otraViviendaPorcentaje: 0,
    otraViviendaMunicipioPorcentaje: 0,
    otraViviendaNavarraPorcentaje: 0,
    numeroViviendas: 0,
    hijos: 0,
    granTenedor: false,
    edificioEntero: false,
    edificioTuristico: false,
    miembrosFamilia: 1,
    patrimonio: 200000,
    irpfModo: "individual",
    renta: 30000,
    // The illustrated foral home does NOT pass the 120m²/96m² area test.
    superficieConstruida: 140,
    superficieUtil: 115,
    unifamiliar: false,
  };
}
export function mapData() {
  const rows: Record<
    string,
    { rate: number; amount: number; rules: string[] }
  > = {};
  for (const [region] of REGIONS) {
    const territories =
      region === "pais-vasco"
        ? (["alava", "bizkaia", "gipuzkoa"] as const)
        : [undefined];
    for (const territory of territories) {
      const input = mapCase(region, territory);
      const result = calculatePurchaseTaxes(input);
      const itp = result.lines.find((line) => line.tax === "ITP");
      if (itp?.amount == null)
        throw new Error("Map cannot silently omit tax: " + region);
      rows[territory ?? region] = {
        rate: (itp.amount / input.precio) * 100,
        amount: itp.amount,
        rules: itp.rules.map((rule) => rule.id),
      };
    }
  }
  return { reviewed: REVIEWED, base: 200000, rows };
}
