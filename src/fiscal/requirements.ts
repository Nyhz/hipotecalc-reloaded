import type { Context, Field, Requirement, Text } from "./types";

export const text = (es: string, en: string): Text => ({ es, en });
export const cents = (n: number) => Math.round((n + Number.EPSILON) * 100);
export const money = (n: number) => cents(n) / 100;
export const known = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);

export const requirement = (
  id: string,
  label: Text,
  fields: Field[],
  check: Requirement["check"],
): Requirement => ({ id, label, fields, check });
export const yes = (field: Field, es: string, en: string) =>
  requirement(field, text(es, en), [field], ({ input }) =>
    input[field] === undefined ? "unknown" : input[field] === true,
  );
export const numberTest = (
  field: Field,
  es: string,
  en: string,
  test: (n: number, c: Context) => boolean,
) =>
  requirement(field, text(es, en), [field], (c) =>
    known(c.input[field]) ? test(c.input[field] as number, c) : "unknown",
  );
export const age = (maxExclusive: number) =>
  numberTest(
    "edad",
    `Edad inferior a ${maxExclusive} años en el devengo`,
    `Under ${maxExclusive} on the purchase date`,
    (n) => n > 0 && n < maxExclusive,
  );
export const cap = (limit: number) =>
  requirement(
    `valor-${limit}`,
    text(
      `Valor fiscal del inmueble ≤ ${limit} €`,
      `Whole-property tax value ≤ €${limit}`,
    ),
    [],
    (c) => cents(c.valor) <= cents(limit),
  );
export const degree = (min: number) =>
  numberTest(
    "gradoDiscapacidad",
    `Discapacidad reconocida ≥ ${min} %`,
    `Certified disability ≥ ${min}%`,
    (n) => n >= min && n <= 100,
  );
export const family = (kind: "numerosa" | "monoparental") =>
  requirement(
    `familia-${kind}`,
    text(
      `Familia ${kind} con acreditación vigente`,
      `Officially recognised ${kind === "numerosa" ? "large" : "single-parent"} family`,
    ),
    ["familia", "familiaAcreditada"],
    ({ input }) => {
      if (input.familia === undefined) return "unknown";
      if (!input.familia.startsWith(kind)) return false;
      return input.familiaAcreditada === undefined
        ? "unknown"
        : input.familiaAcreditada;
    },
  );
export const income = (individual: number, joint: number) =>
  requirement(
    `renta-${individual}-${joint}`,
    text(
      `IRPF: límite ${individual} € individual / ${joint} € conjunta`,
      `IRPF limit: €${individual} individual / €${joint} joint`,
    ),
    ["irpfModo", "renta"],
    ({ input }) => {
      if (!input.irpfModo || !known(input.renta)) return "unknown";
      return (
        cents(input.renta) <=
        cents(input.irpfModo === "individual" ? individual : joint)
      );
    },
  );
export const all = (
  id: string,
  label: Text,
  ...requirements: Requirement[]
): Requirement =>
  requirement(
    id,
    label,
    [...new Set(requirements.flatMap((r) => r.fields))],
    (c) => {
      const answers = requirements.map((r) => r.check(c));
      return answers.includes(false)
        ? false
        : answers.includes("unknown")
          ? "unknown"
          : true;
    },
  );
export const any = (
  id: string,
  label: Text,
  ...requirements: Requirement[]
): Requirement =>
  requirement(
    id,
    label,
    [...new Set(requirements.flatMap((r) => r.fields))],
    (c) => {
      const answers = requirements.map((r) => r.check(c));
      return answers.includes(true)
        ? true
        : answers.includes("unknown")
          ? "unknown"
          : false;
    },
  );
export const habitual = yes(
  "habitual",
  "Será la vivienda habitual según el IRPF",
  "The property will be the main residence under IRPF rules",
);
export const first = yes(
  "primera",
  "Primera vivienda habitual en los términos legales",
  "First main residence under the applicable legal definition",
);
export const deed = yes(
  "escrituraBeneficio",
  "Beneficio y destino declarados en escritura; acreditaciones disponibles",
  "Relief and intended use recorded in the deed; supporting certificates available",
);
export const occupancy = yes(
  "ocupacionMantenimiento",
  "Se cumplirán los plazos legales de ocupación y mantenimiento",
  "The statutory occupation and retention periods will be met",
);
export const rural = requirement(
  "zona-oficial",
  text(
    "Municipio/parroquia incluido en la delimitación oficial aplicable",
    "Municipality/parish included in the applicable official designation",
  ),
  ["municipio", "zona", "zonaOficialConfirmada"],
  ({ input }) => {
    if (input.zona === "normal" || input.zonaOficialConfirmada === false)
      return false;
    if (
      !input.zona ||
      !input.municipio?.trim() ||
      input.zonaOficialConfirmada === undefined
    )
      return "unknown";
    return input.zonaOficialConfirmada;
  },
);
export const protectedHome = requirement(
  "proteccion-acreditada",
  text(
    "Calificación de vivienda protegida vigente y acreditada",
    "Current certified protected-housing classification",
  ),
  ["proteccion", "calificacionVigente"],
  ({ input }) => {
    if (!input.proteccion || input.proteccion === "sin-clasificar")
      return "unknown";
    if (
      input.proteccion === "libre" ||
      input.proteccion === "vpl" ||
      input.proteccion === "precio-tasado-balear"
    )
      return false;
    return input.calificacionVigente === undefined
      ? "unknown"
      : input.calificacionVigente;
  },
);
export const noOther = numberTest(
  "otraViviendaPorcentaje",
  "No se poseen derechos sobre otra vivienda",
  "No ownership or use rights over another home",
  (n) => n === 0,
);
export const soldOrNone = any(
  "venta-o-sin-otra",
  text(
    "Sin otra vivienda o venta dentro del plazo legal aplicable",
    "No other home, or disposal within the applicable statutory period",
  ),
  noOther,
  yes(
    "ventaAnterior",
    "Venta de la vivienda anterior dentro del plazo legal",
    "Previous home disposed of within the statutory period",
  ),
);
