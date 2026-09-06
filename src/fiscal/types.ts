export type Language = "es" | "en";
export type Text = Record<Language, string>;
export type Tax = "ITP" | "IVA" | "IGIC" | "IPSI" | "AJD";
export type Protection =
  | "libre"
  | "general"
  | "especial"
  | "publica"
  | "precio-maximo"
  | "vpl"
  | "precio-tasado-balear"
  | "sin-clasificar";

/** Missing answers remain undefined. In particular, blank income is not zero. */
export interface Buyer {
  porcentaje?: number;
  habitual?: boolean;
  primera?: boolean;
  edad?: number;
  gradoDiscapacidad?: number;
  tipoDiscapacidad?: "fisica-sensorial" | "intelectual-mental";
  discapacidadPermanente?: boolean;
  gradoDiscapacidadFamiliar?: number;
  nucleoFamiliarAcreditado?: boolean;
  movilidadReducida?: boolean;
  familia?:
    | "ninguna"
    | "numerosa-general"
    | "numerosa-especial"
    | "monoparental-general"
    | "monoparental-especial";
  familiaAcreditada?: boolean;
  progenitorConviviente?: boolean;
  miembrosFamilia?: number;
  miembrosMinimosNumerosa?: number;
  hijos?: number;
  hijosMinimosNumerosa?: number;
  hijosMinimosMonoparentalEspecial?: number;
  dependientes?: number;
  irpfModo?: "individual" | "conjunta";
  renta?: number;
  rentaFamiliar?: number;
  rentaAhorro?: number;
  patrimonio?: number;
  residenciaBaleares?: number;
  otraViviendaPorcentaje?: number;
  otraViviendaMunicipioPorcentaje?: number;
  otraViviendaNavarraPorcentaje?: number;
  ventaAnterior?: boolean;
  ampliacionContigua?: boolean;
  superficieAnterior?: number;
  fechaTituloFamilia?: string;
  monoparentalExtremadura?: boolean;
  minimoDiscapacidad?: boolean;
  violenciaAcreditada?: boolean;
  terrorismoAcreditado?: boolean;
  nuncaTitularInmueble?: boolean;
  beneficioForalPrevio?: boolean;
}

/** Prevent one purchaser's missing answer from inheriting another purchaser's eligibility. */
export const BUYER_FIELDS: (keyof Buyer)[] = [
  "porcentaje",
  "habitual",
  "primera",
  "edad",
  "gradoDiscapacidad",
  "tipoDiscapacidad",
  "discapacidadPermanente",
  "gradoDiscapacidadFamiliar",
  "nucleoFamiliarAcreditado",
  "movilidadReducida",
  "familia",
  "familiaAcreditada",
  "progenitorConviviente",
  "miembrosFamilia",
  "miembrosMinimosNumerosa",
  "hijos",
  "hijosMinimosNumerosa",
  "hijosMinimosMonoparentalEspecial",
  "dependientes",
  "irpfModo",
  "renta",
  "rentaFamiliar",
  "rentaAhorro",
  "patrimonio",
  "residenciaBaleares",
  "otraViviendaPorcentaje",
  "otraViviendaMunicipioPorcentaje",
  "otraViviendaNavarraPorcentaje",
  "ventaAnterior",
  "ampliacionContigua",
  "superficieAnterior",
  "fechaTituloFamilia",
  "monoparentalExtremadura",
  "minimoDiscapacidad",
  "violenciaAcreditada",
  "terrorismoAcreditado",
  "nuncaTitularInmueble",
  "beneficioForalPrevio",
];

export interface Purchase extends Buyer {
  precio: number;
  comunidad: string;
  tipoVivienda: "Segunda mano" | "Obra nueva";
  fecha: string;
  referenciaExiste?: boolean;
  valorReferencia?: number;
  valorDeclarado?: number;
  valorMercado?: number;
  valorForal?: number;
  territorioForal?: "alava" | "bizkaia" | "gipuzkoa";
  isla?: "mallorca" | "menorca" | "eivissa" | "formentera";
  proteccion?: Protection;
  calificacionVigente?: boolean;
  entregaPromotor?: boolean;
  plenoDominioSinConsolidacion?: boolean;
  financiacionPublica?: boolean;
  exencionVPO45?: boolean;
  parametrosVPOEstatal?: boolean;
  regimenVPOEstatal?: boolean;
  pagoBancario?: boolean;
  ayudaPublicaAdquisicion?: boolean;
  cambioDomicilioViolencia?: boolean;
  hijosEscolarizadosRural?: boolean;
  ruralAtencionEspecial?: boolean;
  rehabilitacion?: boolean;
  construccionAnterior1970?: boolean;
  rehabilitacionEstructural?: boolean;
  costeRehabilitacion?: number;
  valorSinSuelo?: number;
  rehabilitacionPlazos?: boolean;
  residenciaRuralPlazos?: boolean;
  hipoteca?: number;
  tasacion?: number;
  hipotecaSobreInmueble?: boolean;
  entidadCredito?: boolean;
  superficieConstruida?: number;
  superficieUtil?: number;
  unifamiliar?: boolean;
  parcela?: number;
  municipio?: string;
  zona?: "normal" | "riesgo" | "intensa" | "extrema" | "rural";
  zonaOficialConfirmada?: boolean;
  escrituraBeneficio?: boolean;
  declaracionTransmitente?: boolean;
  ocupacionMantenimiento?: boolean;
  parentescoCompradores?: "otros" | "pareja-registrada";
  adquirentes?: Buyer[];
  granTenedor?: boolean;
  edificioEntero?: boolean;
  edificioTuristico?: boolean;
  exclusionGranTenedor?: boolean;
  numeroViviendas?: number;
  emergencia?: "ninguna" | "dana" | "campanar" | "borrascas-2026";
  emergenciaAcreditada?: boolean;
  solicitudRuina?: boolean;
  porcentajeTitularidadSiniestrada?: number;
  arrendatarioSiniestrado?: boolean;
  viviendaSustituida?: boolean;
  fechaSiniestro?: string;
}

export type Field = keyof Purchase;
export type Check = true | false | "unknown";
export interface Context {
  input: Purchase;
  base: number;
  valor: number;
  share: number;
  allBuyers: Buyer[];
}
export interface Requirement {
  id: string;
  label: Text;
  fields: Field[];
  check: (context: Context) => Check;
}
export interface Source {
  title: string;
  url: string;
  article: string;
  checked: string;
}
export type Tariff =
  | { kind: "flat"; rate: number }
  | {
      kind: "progressive";
      bands: { upTo: number | null; rate: number }[];
      meanRounding?: "balear";
    }
  | { kind: "whole-value"; bands: { upTo: number | null; rate: number }[] }
  | { kind: "partial"; limit: number; rate: number; excessRate: number }
  | {
      kind: "quota";
      underlying: Tariff;
      percent: number;
      limit?: number;
      adjustment: "bonificacion" | "deduccion";
    };

export interface TaxRule {
  id: string;
  comunidad: string;
  impuesto: Tax;
  effectiveFrom: string;
  effectiveTo?: string;
  title: Text;
  source: Source;
  requirements: Requirement[];
  tariff: Tariff | ((context: Context) => Tariff);
  category: "general" | "benefit" | "surcharge" | "exemption";
  /** Highest priority wins within an explicitly incompatible group. No rate-minimum heuristic. */
  priority: number;
  group: string;
}
export interface TaxStep {
  label: Text;
  base: number;
  rate?: number;
  amount: number;
}
export interface AppliedRule {
  id: string;
  title: Text;
  source: Source;
  effectiveFrom: string;
  effectiveTo?: string;
  requirements: Text[];
  buyer: number;
  share: number;
}
export interface TaxLine {
  tax: Tax;
  base: number;
  amount: number | null;
  effectiveRate: number | null;
  steps: TaxStep[];
  rules: AppliedRule[];
}
export interface PendingBenefit {
  rule: string;
  title: Text;
  missing: Text[];
  fields: Field[];
}
export interface TaxResult {
  input: Purchase;
  fiscalBase: number;
  indirectBase: number;
  baseReason: Text;
  lines: TaxLine[];
  total: number | null;
  provisional: boolean;
  warnings: Text[];
  pending: PendingBenefit[];
  reviewed: string;
}
