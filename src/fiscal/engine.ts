import type {
  AppliedRule,
  Buyer,
  Context,
  Language,
  Purchase,
  Tax,
  TaxLine,
  TaxResult,
  Text,
} from "./types";
import { BUYER_FIELDS } from "./types";
import { applicableRules } from "./rules";
import { assess } from "./tariffs";
import { known, money, text } from "./requirements";
import { COVERAGE_FROM, REGIONS, REVIEWED, regionId } from "./sources";

export function calculatePurchaseTaxes(raw: Purchase): TaxResult {
  const input: Purchase = { ...raw, comunidad: regionId(raw.comunidad) };
  const warnings: Text[] = [],
    pending: TaxResult["pending"] = [],
    lines: TaxLine[] = [];
  let provisional = false;
  const note = (es: string, en: string) => {
    warnings.push(text(es, en));
    provisional = true;
  };
  const invalid = (es: string, en: string): TaxResult => ({
    input,
    fiscalBase: 0,
    indirectBase: 0,
    baseReason: text(es, en),
    lines: [],
    total: null,
    provisional: true,
    warnings: [text(es, en)],
    pending: [],
    reviewed: REVIEWED,
  });
  if (!known(input.precio) || input.precio <= 0)
    return invalid(
      "Introduce un precio de compraventa positivo.",
      "Enter a positive purchase price.",
    );
  if (!REGIONS.some(([id]) => id === input.comunidad))
    return invalid(
      "Selecciona la comunidad/ciudad autónoma del inmueble.",
      "Select the property’s autonomous region/city.",
    );
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.fecha) ||
    !Number.isFinite(Date.parse(input.fecha)) ||
    new Date(input.fecha).toISOString().slice(0, 10) !== input.fecha
  )
    return invalid(
      "Introduce una fecha de devengo válida.",
      "Enter a valid purchase/tax-accrual date.",
    );
  if (input.fecha < COVERAGE_FROM)
    return invalid(
      "El motor cubre devengos desde el 01/01/2026. Consulta la normativa histórica para fechas anteriores.",
      "This engine covers purchases from 1 January 2026. Earlier dates require historical legislation.",
    );
  if (input.fecha > REVIEWED)
    note(
      "Fecha posterior a la revisión normativa: simulación con las normas verificadas a 06/09/2026, sujeta a cambios.",
      "Date after the legal review: simulation using rules verified on 6 September 2026, subject to change.",
    );
  if (!["Segunda mano", "Obra nueva"].includes(input.tipoVivienda))
    return invalid(
      "Selecciona vivienda usada o primera entrega de obra nueva.",
      "Select resale housing or a first supply of new housing.",
    );
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "number" && (!Number.isFinite(value) || value < 0))
      return invalid(
        `El dato ${key} no puede ser negativo ni no finito.`,
        `The ${key} value cannot be negative or non-finite.`,
      );
  }
  const buyers: Buyer[] = input.adquirentes?.length
    ? input.adquirentes
    : [{ ...input, porcentaje: input.porcentaje ?? 100 }];
  for (const buyer of buyers) {
    if (
      Object.values(buyer).some(
        (v) => typeof v === "number" && (!Number.isFinite(v) || v < 0),
      )
    )
      return invalid(
        "Los datos de cada comprador deben ser números válidos y no negativos.",
        "Each buyer’s numeric answers must be finite and non-negative.",
      );
    for (const field of [
      "gradoDiscapacidad",
      "gradoDiscapacidadFamiliar",
      "otraViviendaPorcentaje",
      "otraViviendaMunicipioPorcentaje",
      "otraViviendaNavarraPorcentaje",
    ] as const) {
      if (known(buyer[field]) && buyer[field]! > 100)
        return invalid(
          "Los porcentajes no pueden superar el 100 %.",
          "Percentages cannot exceed 100%.",
        );
    }
    for (const field of ["miembrosFamilia", "miembrosMinimosNumerosa"] as const)
      if (
        known(buyer[field]) &&
        (!Number.isInteger(buyer[field]) || buyer[field]! < 1)
      )
        return invalid(
          "Indica un número entero positivo de miembros familiares.",
          "Enter a positive whole-number household size.",
        );
  }
  if (
    buyers.some(
      (b) => !known(b.porcentaje) || b.porcentaje <= 0 || b.porcentaje > 100,
    ) ||
    buyers.reduce((n, b) => n + (b.porcentaje ?? 0), 0) > 100.000001
  )
    return invalid(
      "Los porcentajes adquiridos deben ser positivos y sumar como máximo el 100 %.",
      "Acquired shares must be positive and total no more than 100%.",
    );
  const totalShare = buyers.reduce((n, b) => n + (b.porcentaje ?? 0), 0) / 100;
  const foral = ["navarra", "pais-vasco"].includes(input.comunidad);
  let base = money(Math.max(input.precio, input.valorDeclarado ?? 0));
  let baseReason = text(
    "Mayor entre precio y valor declarado.",
    "Higher of price and declared value.",
  );
  if (foral) {
    base = money(Math.max(base, input.valorForal ?? 0));
    baseReason = text(
      "Valor declarado/precio contrastado con la valoración foral aportada; no se aplica automáticamente el valor de referencia estatal.",
      "Declared value/price checked against the supplied foral valuation; the national reference-value rule is not automatically applied.",
    );
    if (!known(input.valorForal))
      note(
        "Falta la valoración aplicable de la Hacienda Foral: se estima sobre el precio/valor declarado.",
        "The applicable foral valuation is missing: this estimate uses price/declared value.",
      );
    if (input.comunidad === "pais-vasco" && !input.territorioForal)
      note(
        "Selecciona Álava, Bizkaia o Gipuzkoa: sus requisitos y beneficios no son intercambiables.",
        "Select Álava, Bizkaia or Gipuzkoa: their eligibility rules and reliefs differ.",
      );
  } else if (input.referenciaExiste === true) {
    if (!known(input.valorReferencia) || input.valorReferencia <= 0)
      return invalid(
        "Indica el valor de referencia que existe para el inmueble.",
        "Enter the existing reference value for the property.",
      );
    base = money(Math.max(base, input.valorReferencia));
    baseReason = text(
      "Mayor entre precio de compraventa, valor declarado y valor de referencia catastral (ITPAJD, arts. 10 y 30).",
      "Highest of purchase price, declared value and cadastral reference value (ITPAJD arts. 10 and 30).",
    );
  } else if (input.referenciaExiste === false) {
    base = money(Math.max(base, input.valorMercado ?? 0));
    baseReason = text(
      "Sin valor de referencia: mayor entre precio, valor declarado y valor de mercado aportado (art. 10).",
      "No reference value: highest of price, declared value and supplied market value (art. 10).",
    );
    if (!known(input.valorMercado))
      note(
        "No has indicado valor de mercado. La Administración puede comprobar el valor declarado.",
        "No market value was supplied. The tax authority may check the declared value.",
      );
  } else
    note(
      "Falta comprobar si existe valor de referencia. Se usa provisionalmente el precio/valor declarado; el impuesto puede aumentar.",
      "Reference-value availability has not been checked. Price/declared value is used provisionally; tax may increase.",
    );
  const newHome = input.tipoVivienda === "Obra nueva";
  if (newHome)
    warnings.push(
      text(
        "La base de IVA/IGIC/IPSI es el precio sin impuestos, no el valor de referencia. AJD es solo el de la adquisición: no se carga el AJD del préstamo hipotecario al comprador.",
        "IVA/IGIC/IPSI uses the tax-exclusive price, not the reference value. AJD here covers only the purchase deed: the lender’s mortgage AJD is not charged to the buyer.",
      ),
    );
  const taxList: Tax[] = newHome
    ? [
        input.comunidad === "canarias"
          ? "IGIC"
          : ["ceuta", "melilla"].includes(input.comunidad)
            ? "IPSI"
            : "IVA",
        "AJD",
      ]
    : ["ITP"];
  if (newHome)
    lines.push({
      tax: "ITP",
      base: 0,
      amount: 0,
      effectiveRate: 0,
      steps: [],
      rules: [],
    });
  for (const tax of taxList) {
    const taxBase = ["IVA", "IGIC", "IPSI"].includes(tax)
      ? money(input.precio)
      : base;
    const line: TaxLine = {
      tax,
      base: money(taxBase * totalShare),
      amount: 0,
      effectiveRate: 0,
      steps: [],
      rules: [],
    };
    if (
      tax === "IPSI" &&
      !applicableRules(input.comunidad, tax, input.fecha).length
    ) {
      // No generic invented rate: municipal rates/exemptions must be checked before including IPSI.
      line.amount = null;
      line.effectiveRate = null;
      note(
        "IPSI pendiente de verificación individual con Servicios Tributarios de Ceuta/Melilla. No se inventa un tipo ni se muestra un total incompleto como definitivo.",
        "IPSI requires individual verification with Ceuta/Melilla tax services. No rate is invented and an incomplete total is not presented as final.",
      );
      lines.push(line);
      continue;
    }
    for (const [index, buyer] of buyers.entries()) {
      const shared = { ...input };
      if (input.adquirentes?.length)
        for (const field of BUYER_FIELDS) delete shared[field];
      const personal: Purchase = input.adquirentes?.length
        ? { ...shared, ...buyer }
        : input;
      // CLM art. 22 and CyL young relief require all purchasers to qualify, not just one share.
      const candidates = applicableRules(
        tax === "IVA" ? "estatal" : input.comunidad,
        tax,
        input.fecha,
      );
      const context: Context = {
        input: personal,
        base: taxBase,
        valor: tax === "IGIC" ? input.precio : base,
        share: (buyer.porcentaje ?? 100) / 100,
        allBuyers: buyers,
      };
      const checked = candidates.map((rule) => {
        let checks = rule.requirements.map((req) => req.check(context));
        if (
          buyers.length > 1 &&
          rule.priority > 0 &&
          (input.comunidad === "castilla-la-mancha" ||
            (input.comunidad === "castilla-y-leon" &&
              rule.id.includes("joven")))
        ) {
          checks = buyers.flatMap((other) =>
            rule.requirements.map((req) =>
              req.check({
                ...context,
                input: { ...shared, ...other },
                share: (other.porcentaje ?? 100) / 100,
              }),
            ),
          );
        }
        return { rule, checks };
      });
      const valid = checked
        .filter((x) => x.checks.every((v) => v === true))
        .sort(
          (a, b) =>
            b.rule.priority - a.rule.priority ||
            a.rule.id.localeCompare(b.rule.id),
        );
      const selected = valid[0]?.rule;
      if (!selected) {
        line.amount = null;
        continue;
      }
      for (const { rule, checks } of checked) {
        if (
          rule.priority <= selected.priority ||
          checks.includes(false) ||
          !checks.includes("unknown")
        )
          continue;
        const missing = rule.requirements.filter(
          (req) => req.check(context) === "unknown",
        );
        pending.push({
          rule: rule.id,
          title: rule.title,
          missing: missing.map((r) => r.label),
          fields: [...new Set(missing.flatMap((r) => r.fields))],
        });
        provisional = true;
        if (
          rule.category === "surcharge" &&
          (input.granTenedor === true ||
            input.edificioEntero === true ||
            input.edificioTuristico === true)
        )
          line.amount = null;
      }
      const tariff =
        typeof selected.tariff === "function"
          ? selected.tariff(context)
          : selected.tariff;
      const assessed = assess(tariff, taxBase, context.share);
      if (line.amount !== null)
        line.amount = money(line.amount + assessed.amount);
      line.steps.push(
        ...assessed.steps.map((s) =>
          buyers.length === 1
            ? s
            : {
                ...s,
                label: text(
                  `Comprador ${index + 1}: ${s.label.es}`,
                  `Buyer ${index + 1}: ${s.label.en}`,
                ),
              },
        ),
      );
      const applied: AppliedRule = {
        id: selected.id,
        title: selected.title,
        source: selected.source,
        effectiveFrom: selected.effectiveFrom,
        effectiveTo: selected.effectiveTo,
        requirements: selected.requirements.map((r) => r.label),
        buyer: index + 1,
        share: context.share,
      };
      line.rules.push(applied);
    }
    line.effectiveRate =
      line.amount === null
        ? null
        : line.base > 0
          ? (line.amount / line.base) * 100
          : 0;
    lines.push(line);
  }
  if (input.emergencia && input.emergencia !== "ninguna")
    note(
      "Has indicado un supuesto extraordinario. Solo se aplicará con su regla temporal y todas las acreditaciones; si no figura en el desglose, consulta el régimen específico antes de autoliquidar.",
      "You selected an extraordinary event. Relief requires its date-based rule and all supporting evidence; if absent from the breakdown, check the specific regime before filing.",
    );
  if (
    input.exencionVPO45 === true &&
    !lines.some((l) =>
      l.rules.some((r) => r.id.endsWith("vpo-exencion-estatal")),
    )
  )
    note(
      "No se ha podido acreditar la exención VPO del art. 45.I.B.12: revisa la calificación definitiva y, en su caso, su equivalencia con los parámetros estatales.",
      "The art. 45.I.B.12 VPO exemption could not be established: check definitive classification and, where relevant, equivalence to national parameters.",
    );
  if (input.comunidad === "pais-vasco" && input.numeroViviendas === undefined)
    note(
      "Sin número de viviendas previas: el 4 % es provisional. Si ya eres titular de más de cinco viviendas en más del 50 %, puede proceder el 6 %, salvo beneficio aplicable.",
      "Previous home count is missing: 4% is provisional. Owning more than five homes at over 50% may trigger 6%, unless a qualifying relief applies.",
    );
  if (
    input.comunidad === "baleares" &&
    ["vpl", "precio-tasado-balear"].includes(input.proteccion ?? "") &&
    lines.some((l) =>
      l.rules.some((r) => r.id.includes("bonificacion100-parcial")),
    )
  )
    note(
      "La concurrencia de VPL/precio tasado y bonificación del 100 % exige comprobar su aplicación conjunta con ATIB. No se acumula automáticamente el 50 % sobre el exceso.",
      "Concurrent VPL/controlled-price and 100% relief requires ATIB confirmation. The extra 50% is not automatically stacked on the excess.",
    );
  if (input.adquirentes?.length && input.comunidad !== "galicia")
    note(
      "Las extensiones de beneficios entre cónyuges y requisitos conjuntos varían por territorio; verifica este supuesto antes de autoliquidar.",
      "Spousal extensions and joint eligibility vary by territory; verify this case before filing.",
    );
  if (
    ["navarra", "pais-vasco"].includes(input.comunidad) &&
    input.proteccion &&
    input.proteccion !== "libre"
  )
    note(
      "La exención específica de vivienda protegida foral no está automatizada. En Navarra, el art. 35.I.B.13 exige calificación conforme a la Ley Foral 10/2010 y, para la primera transmisión, el plazo de seis años desde la calificación definitiva. Confirma el régimen foral antes de usar esta estimación.",
      "Specific foral protected-housing exemptions are not automated. In Navarra, art. 35.I.B.13 requires classification under Ley Foral 10/2010 and, for the first transfer, the six-year period from final classification. Confirm the foral regime before relying on this estimate.",
    );
  const total = lines.some((l) => l.amount === null)
    ? null
    : money(lines.reduce((n, l) => n + (l.amount ?? 0), 0));
  return {
    input,
    fiscalBase: money(base * totalShare),
    indirectBase: money(input.precio * totalShare),
    baseReason,
    lines,
    total,
    provisional,
    warnings,
    pending,
    reviewed: REVIEWED,
  };
}

export function resultDescription(
  result: TaxResult,
  lang: Language = "es",
): string {
  if (result.total === null)
    return lang === "es"
      ? "Cálculo pendiente: faltan datos o verificación territorial."
      : "Calculation pending: missing data or territorial verification.";
  const names = [
    ...new Set(result.lines.flatMap((l) => l.rules.map((r) => r.title[lang]))),
  ].join(" · ");
  return `${result.provisional ? (lang === "es" ? "Estimación provisional. " : "Provisional estimate. ") : ""}${names}`;
}

/** Shared default for other tools. No community selected means no calculable tax, never “6% Spain”. */
export function defaultPurchase(
  precio: number,
  comunidad: string,
  tipoVivienda: Purchase["tipoVivienda"] = "Segunda mano",
): Purchase {
  return {
    precio,
    comunidad,
    tipoVivienda,
    fecha: REVIEWED,
    proteccion: "libre",
    emergencia: "ninguna",
  };
}
