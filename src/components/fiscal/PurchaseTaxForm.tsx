import { useId, useState } from "react";
import type { Field, Language, Purchase, TaxResult } from "../../fiscal/types";
import { BUYER_FIELDS } from "../../fiscal/types";
import { calculatePurchaseTaxes } from "../../fiscal/engine";
import { applicableRules } from "../../fiscal/rules";
import { REGIONS, REVIEWED, regionId } from "../../fiscal/sources";
import TaxBreakdown from "./TaxBreakdown";

type Props = {
  value: Purchase;
  onChange: (value: Purchase) => void;
  onResult?: (result: TaxResult) => void;
  lang?: Language;
  showResult?: boolean;
  investment?: boolean;
};
const NUMBER_FIELDS = new Set<Field>([
  "edad",
  "gradoDiscapacidad",
  "gradoDiscapacidadFamiliar",
  "renta",
  "rentaFamiliar",
  "rentaAhorro",
  "patrimonio",
  "miembrosFamilia",
  "miembrosMinimosNumerosa",
  "hijos",
  "hijosMinimosNumerosa",
  "hijosMinimosMonoparentalEspecial",
  "dependientes",
  "residenciaBaleares",
  "otraViviendaPorcentaje",
  "otraViviendaMunicipioPorcentaje",
  "otraViviendaNavarraPorcentaje",
  "hipoteca",
  "tasacion",
  "superficieUtil",
  "superficieConstruida",
  "superficieAnterior",
  "parcela",
  "numeroViviendas",
  "porcentaje",
  "costeRehabilitacion",
  "valorSinSuelo",
]);
const CHOICES: Partial<Record<Field, [string, string, string][]>> = {
  familia: [
    ["ninguna", "Ninguna de estas categorías", "None of these categories"],
    [
      "numerosa-general",
      "Familia numerosa general",
      "Large family, general category",
    ],
    [
      "numerosa-especial",
      "Familia numerosa especial",
      "Large family, special category",
    ],
    [
      "monoparental-general",
      "Monoparental general",
      "Single-parent, general category",
    ],
    [
      "monoparental-especial",
      "Monoparental especial",
      "Single-parent, special category",
    ],
  ],
  irpfModo: [
    ["individual", "Individual", "Individual"],
    ["conjunta", "Conjunta", "Joint"],
  ],
  tipoDiscapacidad: [
    ["fisica-sensorial", "Física/sensorial", "Physical/sensory"],
    ["intelectual-mental", "Intelectual/mental", "Intellectual/mental"],
  ],
  zona: [
    [
      "normal",
      "Sin clasificación rural elegible",
      "No eligible rural classification",
    ],
    ["riesgo", "Riesgo de despoblación", "At risk of depopulation"],
    ["intensa", "Intensa despoblación", "Intense depopulation"],
    ["extrema", "Extrema despoblación", "Extreme depopulation"],
    [
      "rural",
      "Otra delimitación rural oficial",
      "Other official rural designation",
    ],
  ],
  emergencia: [
    ["ninguna", "Ninguno", "None"],
    ["dana", "DANA 2024", "DANA 2024"],
    ["campanar", "Incendio de Campanar", "Campanar fire"],
    ["borrascas-2026", "Borrascas de Andalucía 2026", "Andalusia storms 2026"],
  ],
};
const LABELS: Partial<Record<Field, [string, string]>> = {
  habitual: [
    "¿Será tu vivienda habitual?",
    "Will this be your main residence?",
  ],
  primera: [
    "¿Primera vivienda habitual según la definición legal?",
    "First main residence under the legal definition?",
  ],
  edad: [
    "Edad en la fecha de devengo (años)",
    "Age on the tax-accrual date (years)",
  ],
  familia: ["Categoría familiar oficial", "Official family category"],
  gradoDiscapacidad: [
    "Grado de discapacidad reconocido (%)",
    "Certified disability degree (%)",
  ],
  renta: [
    "Base IRPF relevante para esta comunidad (€), no salario bruto",
    "Relevant IRPF tax base for this region (€), not gross salary",
  ],
  rentaFamiliar: [
    "Renta/base IRPF familiar ajustada según el requisito legal (€)",
    "Adjusted household income/IRPF base under the statutory definition (€)",
  ],
  rentaAhorro: ["Base del ahorro IRPF (€)", "IRPF savings tax base (€)"],
  irpfModo: ["Modalidad de declaración IRPF", "IRPF filing mode"],
  patrimonio: [
    "Patrimonio familiar computable, incluida la vivienda adquirida (€)",
    "Assessable household assets, including the purchased home (€)",
  ],
  miembrosFamilia: [
    "Miembros computables de la unidad familiar",
    "Qualifying household members",
  ],
  miembrosMinimosNumerosa: [
    "Mínimo de miembros exigido para tu título de familia numerosa",
    "Minimum members required for your large-family certificate",
  ],
  hijos: ["Número de hijos computables", "Number of qualifying children"],
  hijosMinimosNumerosa: [
    "Mínimo de hijos exigido para tu título de familia numerosa",
    "Minimum children required for your large-family certificate",
  ],
  fechaTituloFamilia: [
    "Fecha del título de familia numerosa / nacimiento / adopción habilitante",
    "Date of the qualifying large-family certificate / birth / adoption",
  ],
  hijosMinimosMonoparentalEspecial: [
    "Mínimo de hijos de la categoría monoparental especial aplicable",
    "Minimum children for the applicable special single-parent category",
  ],
  hipoteca: [
    "Importe del préstamo hipotecario (€)",
    "Mortgage loan amount (€)",
  ],
  tasacion: ["Valor de tasación (€)", "Appraisal value (€)"],
  residenciaBaleares: [
    "Años de residencia habitual previa en Illes Balears",
    "Years of prior habitual residence in the Balearic Islands",
  ],
  porcentaje: [
    "Porcentaje de plena propiedad adquirido (%)",
    "Full-ownership share acquired (%)",
  ],
  otraViviendaPorcentaje: [
    "Mayor porcentaje de propiedad/uso sobre otra vivienda (%)",
    "Highest ownership/use share in another home (%)",
  ],
  otraViviendaMunicipioPorcentaje: [
    "Mayor titularidad de otra vivienda en el mismo municipio (%)",
    "Highest ownership share in another home in this municipality (%)",
  ],
  otraViviendaNavarraPorcentaje: [
    "Mayor titularidad familiar sobre otra vivienda en Navarra (%)",
    "Highest household-member ownership of another home in Navarra (%)",
  ],
  superficieConstruida: [
    "Superficie construida de la vivienda (m²)",
    "Home built area (m²)",
  ],
  superficieUtil: [
    "Superficie útil de la vivienda (m²)",
    "Home usable area (m²)",
  ],
  superficieAnterior: [
    "Superficie útil de la vivienda anterior (m²)",
    "Previous home usable area (m²)",
  ],
  parcela: [
    "Superficie de la parcela, incluida edificación (m²)",
    "Plot area including building (m²)",
  ],
  municipio: [
    "Municipio/parroquia/concejo (nombre completo)",
    "Municipality/parish/council (full name)",
  ],
  zona: ["Clasificación rural oficial", "Official rural classification"],
  numeroViviendas: [
    "Viviendas en las que ya posees más del 50 %",
    "Homes in which you already own more than 50%",
  ],
  emergencia: [
    "Supuesto extraordinario (solo si te afecta)",
    "Extraordinary event (only if it affects you)",
  ],
};
const PRIMARY: Field[] = [
  "habitual",
  "primera",
  "edad",
  "familia",
  "gradoDiscapacidad",
];
const EMERGENCY: Field[] = [
  "emergencia",
  "emergenciaAcreditada",
  "fechaSiniestro",
  "viviendaSustituida",
  "solicitudRuina",
  "porcentajeTitularidadSiniestrada",
  "arrendatarioSiniestrado",
];
const PROPERTY = new Set<Field>([
  "precio",
  "comunidad",
  "tipoVivienda",
  "fecha",
  "referenciaExiste",
  "valorReferencia",
  "valorDeclarado",
  "valorMercado",
  "valorForal",
  "territorioForal",
  "isla",
  "proteccion",
  "calificacionVigente",
  "entregaPromotor",
  "granTenedor",
  "edificioEntero",
  "edificioTuristico",
  "exclusionGranTenedor",
  ...EMERGENCY,
]);

export default function PurchaseTaxForm({
  value,
  onChange,
  onResult,
  lang = "es",
  showResult = true,
  investment = false,
}: Props) {
  const en = lang === "en",
    id = useId(),
    [result, setResult] = useState<TaxResult | null>(null);
  const region = regionId(value.comunidad),
    tax = value.tipoVivienda === "Obra nueva" ? "AJD" : "ITP";
  const indirect =
    region === "canarias"
      ? "IGIC"
      : ["ceuta", "melilla"].includes(region)
        ? "IPSI"
        : "IVA";
  const rules = [
    ...applicableRules(region, tax, value.fecha),
    ...(value.tipoVivienda === "Obra nueva"
      ? applicableRules(
          indirect === "IVA" ? "estatal" : region,
          indirect,
          value.fecha,
        )
      : []),
  ];
  const reqs = rules
    .filter((r) => r.priority > 0)
    .flatMap((r) => r.requirements);
  const fields = [...new Set(reqs.flatMap((r) => r.fields))].filter(
    (f) => !PROPERTY.has(f),
  );
  const set = (field: Field, next: unknown, buyerIndex = 0) => {
    setResult(null);
    if (value.adquirentes?.length && BUYER_FIELDS.some((f) => f === field)) {
      const acquired = value.adquirentes.map((b, i) =>
        i === buyerIndex ? { ...b, [field]: next } : b,
      );
      onChange(
        buyerIndex === 0
          ? { ...value, [field]: next, adquirentes: acquired }
          : { ...value, adquirentes: acquired },
      );
    } else onChange({ ...value, [field]: next });
  };
  const control = (
    field: Field,
    label?: string,
    kind?: "number" | "text" | "date",
    buyerIndex = 0,
  ) => {
    const choices = CHOICES[field],
      spec = reqs.find((r) => r.fields.includes(field));
    const caption =
      label ?? LABELS[field]?.[en ? 1 : 0] ?? spec?.label[lang] ?? field;
    const numeric =
      kind === "number" ||
      NUMBER_FIELDS.has(field) ||
      field === "porcentajeTitularidadSiniestrada";
    const stringField =
      kind === "text" ||
      kind === "date" ||
      field === "municipio" ||
      field === "fechaTituloFamilia";
    const current =
      buyerIndex > 0
        ? (value.adquirentes?.[buyerIndex] as Partial<Purchase>)?.[field]
        : value[field];
    return (
      <div key={field} className="min-w-0">
        <label
          className="block text-sm text-ink mb-1"
          htmlFor={`${id}-${buyerIndex}-${field}`}
        >
          {caption}
        </label>
        {numeric || stringField ? (
          <input
            id={`${id}-${buyerIndex}-${field}`}
            name={buyerIndex ? `buyer-${buyerIndex}-${field}` : field}
            className="input-pl w-full"
            type={
              numeric
                ? "number"
                : field === "fechaTituloFamilia"
                  ? "date"
                  : (kind ?? "text")
            }
            min={numeric ? 0 : undefined}
            step={numeric ? "0.01" : undefined}
            value={
              typeof current === "number" || typeof current === "string"
                ? current
                : ""
            }
            onChange={(e) =>
              set(
                field,
                e.target.value === ""
                  ? undefined
                  : numeric
                    ? Number(e.target.value)
                    : e.target.value,
                buyerIndex,
              )
            }
          />
        ) : (
          <select
            id={`${id}-${buyerIndex}-${field}`}
            name={buyerIndex ? `buyer-${buyerIndex}-${field}` : field}
            className="input-pl w-full"
            value={current === undefined ? "" : String(current)}
            onChange={(e) =>
              set(
                field,
                e.target.value === ""
                  ? undefined
                  : choices
                    ? e.target.value
                    : e.target.value === "true",
                buyerIndex,
              )
            }
          >
            <option value="">
              {en ? "Not yet confirmed" : "Sin confirmar"}
            </option>
            {choices ? (
              choices.map(([key, es, eng]) => (
                <option key={key} value={key}>
                  {en ? eng : es}
                </option>
              ))
            ) : (
              <>
                <option value="true">{en ? "Yes" : "Sí"}</option>
                <option value="false">No</option>
              </>
            )}
          </select>
        )}
        {["renta", "rentaFamiliar", "rentaAhorro"].includes(field) && (
          <p className="text-xs text-ink-soft mt-1">{spec?.label[lang]}</p>
        )}
      </div>
    );
  };
  const select = (field: Field, label: string, options: [string, string][]) => (
    <div className="min-w-0">
      <label htmlFor={`${id}-${field}`} className="block text-sm mb-1">
        {label}
      </label>
      <select
        className="input-pl w-full"
        id={`${id}-${field}`}
        name={field}
        value={
          field === "comunidad"
            ? (REGIONS.find(
                ([key, name]) =>
                  key === value.comunidad || name === value.comunidad,
              )?.[1] ?? "")
            : String(value[field] ?? "")
        }
        onChange={(e) => set(field, e.target.value || undefined)}
      >
        <option value="">{en ? "Select" : "Selecciona"}</option>
        {options.map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
  const foral = ["navarra", "pais-vasco"].includes(region);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const next = calculatePurchaseTaxes(
          investment
            ? { ...value, habitual: false, adquirentes: undefined }
            : value,
        );
        setResult(next);
        onResult?.(next);
      }}
      className="space-y-5"
      data-purchase-tax-form
    >
      {investment && (
        <p className="text-sm text-ink-soft">
          {en
            ? "Rental investment: main-residence relief is not applied."
            : "Inversión para alquiler: no se aplican beneficios de vivienda habitual."}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {control(
          "precio",
          en
            ? "Whole-property purchase price, excluding taxes (€)"
            : "Precio de compraventa del inmueble completo, sin impuestos (€)",
          "number",
        )}
        {select(
          "comunidad",
          en ? "Autonomous region/city" : "Comunidad/ciudad autónoma",
          REGIONS.map(([, name]) => [name, name]),
        )}
        {select(
          "tipoVivienda",
          en ? "Property transaction" : "Tipo de transmisión",
          [
            ["Segunda mano", en ? "Resale home" : "Vivienda usada"],
            [
              "Obra nueva",
              en ? "First supply by developer" : "Primera entrega por promotor",
            ],
          ],
        )}
        {control(
          "fecha",
          en ? "Purchase / tax-accrual date" : "Fecha de adquisición / devengo",
          "date",
        )}
        {foral
          ? control(
              "valorForal",
              en
                ? "Applicable foral assessed value (€)"
                : "Valor fiscal aplicable según Hacienda Foral (€)",
              "number",
            )
          : control(
              "referenciaExiste",
              en
                ? "Does a cadastral reference value exist?"
                : "¿Existe valor de referencia catastral?",
            )}
        {!foral &&
          value.referenciaExiste === true &&
          control(
            "valorReferencia",
            en
              ? "Cadastral reference value (€)"
              : "Valor de referencia catastral (€)",
            "number",
          )}
        {!foral &&
          value.referenciaExiste === false &&
          control(
            "valorMercado",
            en
              ? "Market value, where known (€)"
              : "Valor de mercado, si se conoce (€)",
            "number",
          )}
        {control(
          "valorDeclarado",
          en
            ? "Declared value, if different from price (€)"
            : "Valor declarado, si difiere del precio (€)",
          "number",
        )}
        {region === "baleares" &&
          select("isla", en ? "Island" : "Isla", [
            ["mallorca", "Mallorca"],
            ["menorca", "Menorca"],
            ["eivissa", "Eivissa"],
            ["formentera", "Formentera"],
          ])}
        {region === "pais-vasco" &&
          select(
            "territorioForal",
            en ? "Historical territory" : "Territorio histórico",
            [
              ["alava", "Álava"],
              ["bizkaia", "Bizkaia"],
              ["gipuzkoa", "Gipuzkoa"],
            ],
          )}
      </div>
      <details className="border-t border-line pt-4">
        <summary className="cursor-pointer text-brand-blue">
          {en
            ? "Check personal relief and protected-housing rules"
            : "Comprobar beneficios personales y vivienda protegida"}
        </summary>
        <p className="text-xs text-ink-soft my-3">
          {en
            ? "Blank answers do not establish eligibility. Enter the tax base requested, not gross salary; certificates and retention requirements still apply."
            : "Las respuestas en blanco no acreditan requisitos. Introduce la base fiscal solicitada, no el salario bruto; siguen siendo exigibles las acreditaciones y los plazos de mantenimiento."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRIMARY.filter(
            (f) => fields.includes(f) && !(investment && f === "habitual"),
          ).map((f) => control(f))}
          {select(
            "proteccion",
            en
              ? "Official housing classification"
              : "Clasificación oficial de la vivienda",
            [
              ["libre", en ? "Free-market housing" : "Vivienda libre"],
              ["general", en ? "General-regime VPO" : "VPO de régimen general"],
              [
                "especial",
                en ? "Special-regime VPO" : "VPO de régimen especial",
              ],
              [
                "publica",
                en ? "Public-promotion VPO" : "VPO de promoción pública",
              ],
              [
                "precio-maximo",
                en
                  ? "Protected home with statutory maximum price"
                  : "Protegida con precio máximo legal",
              ],
              [
                "vpl",
                en
                  ? "VPL / limited-price housing"
                  : "VPL / vivienda de precio limitado",
              ],
              ...(region === "baleares"
                ? ([
                    [
                      "precio-tasado-balear",
                      en
                        ? "Controlled-price housing under Ley 5/2008"
                        : "Vivienda de precio tasado (Ley 5/2008)",
                    ],
                  ] as [string, string][])
                : []),
              [
                "sin-clasificar",
                en
                  ? "Protected, exact regime not confirmed"
                  : "Protegida, régimen sin confirmar",
              ],
            ],
          )}
          {value.proteccion &&
            value.proteccion !== "libre" &&
            control(
              "calificacionVigente",
              en
                ? "Current official classification certificate available?"
                : "¿Dispones de la calificación oficial vigente?",
            )}
          {value.tipoVivienda === "Obra nueva" &&
            control(
              "entregaPromotor",
              en
                ? "Supply made by the developer?"
                : "¿Entrega realizada por el promotor?",
            )}
          {fields
            .filter((f) => !(region === "pais-vasco" && f === "numeroViviendas"))
            .filter((f) => !PRIMARY.includes(f))
            .filter((f) => {
              const protectedField = [
                "financiacionPublica",
                "exencionVPO45",
                "regimenVPOEstatal",
                "parametrosVPOEstatal",
              ].includes(f);
              if (
                protectedField &&
                (value.tipoVivienda !== "Obra nueva" ||
                  !value.proteccion ||
                  value.proteccion === "libre")
              )
                return false;
              const generalRuralField =
                region === "galicia" &&
                ["zona", "municipio", "zonaOficialConfirmada"].includes(f);
              if (
                value.habitual === false &&
                !protectedField &&
                !generalRuralField
              )
                return false;
              if (
                ["municipio", "zonaOficialConfirmada"].includes(f) &&
                (!value.zona || value.zona === "normal")
              )
                return false;
              if (
                [
                  "ruralAtencionEspecial",
                  "hijosEscolarizadosRural",
                  "rehabilitacion",
                  "residenciaRuralPlazos",
                ].includes(f) &&
                (!value.zona || value.zona === "normal")
              )
                return false;
              if (
                [
                  "construccionAnterior1970",
                  "rehabilitacionEstructural",
                  "costeRehabilitacion",
                  "valorSinSuelo",
                  "rehabilitacionPlazos",
                ].includes(f) &&
                value.rehabilitacion !== true
              )
                return false;
              if (f === "regimenVPOEstatal" || f === "parametrosVPOEstatal")
                return value.exencionVPO45 === true;
              if (
                [
                  "familiaAcreditada",
                  "progenitorConviviente",
                  "miembrosMinimosNumerosa",
                  "hijosMinimosNumerosa",
                  "hijosMinimosMonoparentalEspecial",
                  "monoparentalExtremadura",
                ].includes(f) &&
                (!value.familia || value.familia === "ninguna")
              )
                return false;
              if (
                ["tipoDiscapacidad", "discapacidadPermanente"].includes(f) &&
                !value.gradoDiscapacidad
              )
                return false;
              return true;
            })
            .map((f) => control(f))}
        </div>
        {fields.includes("zona") && (
          <p className="text-xs text-ink-soft mt-3">
            {en
              ? "Rural relief requires the official list for this region and date, not simply a small population. Check the rule’s source before confirming the designation."
              : "El beneficio rural exige la lista o delimitación oficial de esa comunidad y fecha, no simplemente poca población. Consulta la fuente de la regla antes de confirmar la clasificación."}{" "}
            <a
              href={
                rules.find((r) =>
                  r.requirements.some((q) => q.fields.includes("zona")),
                )?.source.url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {en ? "Official legislation" : "Normativa oficial"}
            </a>
          </p>
        )}
      </details>
      {["andalucia", "comunidad-valenciana"].includes(region) && (
        <details className="border-t border-line pt-4">
          <summary className="cursor-pointer">
            {en
              ? "Extraordinary temporary relief (affected properties only)"
              : "Beneficios extraordinarios temporales (solo afectados)"}
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {select(
              "emergencia",
              en ? "Affected event" : "Supuesto que te afecta",
              region === "andalucia"
                ? [
                    ["ninguna", en ? "None" : "Ninguno"],
                    [
                      "borrascas-2026",
                      en
                        ? "Andalusia storms 2026"
                        : "Borrascas de Andalucía 2026",
                    ],
                  ]
                : [
                    ["ninguna", en ? "None" : "Ninguno"],
                    ["dana", "DANA 2024"],
                    ["campanar", "Campanar"],
                  ],
            )}
            {value.emergencia && value.emergencia !== "ninguna" && (
              <>
                {EMERGENCY.filter(
                  (f) =>
                    f !== "emergencia" &&
                    reqs.some((r) => r.fields.includes(f)),
                ).map((f) =>
                  control(
                    f,
                    undefined,
                    f === "fechaSiniestro" ? "date" : undefined,
                  ),
                )}
                {value.emergencia === "campanar" &&
                  control(
                    "granTenedor",
                    en
                      ? "Large holder under Ley 12/2023?"
                      : "¿Gran tenedor según Ley 12/2023?",
                  )}
              </>
            )}
          </div>
        </details>
      )}
      {region === "galicia" && !investment && (
        <details className="border-t border-line pt-4">
          <summary className="cursor-pointer">
            {en
              ? "More than one purchaser: individual eligibility"
              : "Más de un comprador: requisitos por persona"}
          </summary>
          <p className="text-xs my-3">
            {en
              ? "The profile above belongs to buyer 1. Each additional buyer has independent answers; the benefit applies only to the qualifying share. Enter the entire property price above."
              : "El perfil anterior corresponde al comprador 1. Cada comprador adicional tiene respuestas independientes; el beneficio se aplica solo a su parte. Introduce arriba el precio del inmueble completo."}
          </p>
          {!value.adquirentes?.length ? (
            <button
              type="button"
              className="btn-outline px-4 py-2"
              onClick={() => {
                setResult(null);
                onChange({
                  ...value,
                  porcentaje: 50,
                  adquirentes: [
                    {
                      ...Object.fromEntries(
                        BUYER_FIELDS.map((f) => [f, value[f]]),
                      ),
                      porcentaje: 50,
                    },
                    { porcentaje: 50 },
                  ],
                });
              }}
            >
              {en ? "Add second buyer" : "Añadir segundo comprador"}
            </button>
          ) : (
            <>
              {control(
                "porcentaje",
                en
                  ? "Buyer 1 ownership share (%)"
                  : "Porcentaje del comprador 1 (%)",
                "number",
              )}
              {value.adquirentes.slice(1).map((_, i) => (
                <fieldset
                  key={i}
                  className="border border-line rounded-xl p-4 mt-3"
                >
                  <legend>
                    {en ? "Buyer" : "Comprador"} {i + 2}
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      ...new Set<Field>([
                        "porcentaje",
                        ...fields.filter((f) =>
                          BUYER_FIELDS.some((b) => b === f),
                        ),
                      ]),
                    ].map((f) => control(f, undefined, undefined, i + 1))}
                  </div>
                </fieldset>
              ))}
              <button
                type="button"
                className="underline mt-3"
                onClick={() => {
                  setResult(null);
                  onChange({
                    ...value,
                    adquirentes: undefined,
                    porcentaje: 100,
                  });
                }}
              >
                {en ? "Return to one buyer" : "Volver a un comprador"}
              </button>
            </>
          )}
        </details>
      )}
      {["asturias", "cataluna", "pais-vasco"].includes(region) && (
        <details className="border-t border-line pt-4">
          <summary className="cursor-pointer">
            {en
              ? "Other properties / exceptional higher rates"
              : "Otras viviendas / tipos agravados excepcionales"}
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {region === "pais-vasco"
              ? control("numeroViviendas")
              : control(
                  "granTenedor",
                  en
                    ? "Statutory large holder (including this purchase)?"
                    : "¿Gran tenedor según la norma autonómica, incluida esta compra?",
                )}
            {region === "cataluna" &&
              control(
                "edificioEntero",
                en
                  ? "Acquiring an entire residential building?"
                  : "¿Adquieres un edificio entero de viviendas?",
              )}
            {region === "asturias" &&
              control(
                "edificioTuristico",
                en
                  ? "Residential building for tourist use under art. 31 bis?"
                  : "¿Edificio con destino turístico en el supuesto del art. 31 bis?",
              )}
            {control(
              "exclusionGranTenedor",
              en
                ? "Documented statutory exclusion from the higher rate?"
                : "¿Concurre una exclusión legal acreditada del tipo agravado?",
            )}
          </div>
        </details>
      )}
      <button type="submit" className="btn-ink px-6 py-3">
        {en ? "Calculate purchase taxes" : "Calcular impuestos de adquisición"}
      </button>
      {result && showResult && <TaxBreakdown result={result} lang={lang} />}
      <p className="text-xs text-ink-soft">
        {en ? "Rules reviewed" : "Normas revisadas"}: {REVIEWED}.{" "}
        {en
          ? "For purchases from 1 January 2026."
          : "Para devengos desde el 1 de enero de 2026."}
      </p>
    </form>
  );
}
