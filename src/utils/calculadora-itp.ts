import {
  calculatePurchaseTaxes,
  defaultPurchase,
  resultDescription,
} from "../fiscal/engine";
import type { Language, Purchase } from "../fiscal/types";

/** Compatibility entry point. New callers should pass the complete fiscal input. */
interface ITPParams {
  precio: number;
  tipoVivienda: string;
  comunidad: string;
  lang?: Language;
  fiscal?: Purchase;
  edad?: number;
  discapacidad?: boolean;
  porcentajeDiscapacidad?: number;
  situacion?: string;
  numHijos?: number;
  victimaViolencia?: boolean;
  victimaTerrorismo?: boolean;
  zonaDespoblada?: boolean;
  primeraVivienda?: boolean;
  tipoReducido?: boolean;
  ingresos?: number;
  hipoteca?: number;
  tasacion?: number;
  patrimonio?: number;
  residencia?: number;
  ventaAnterior?: boolean;
  vpo?: boolean;
}
export function calcularITPAvanzado(params: ITPParams) {
  const input = params.fiscal ?? {
    ...defaultPurchase(
      params.precio,
      params.comunidad,
      params.tipoVivienda === "Obra nueva" ? "Obra nueva" : "Segunda mano",
    ),
    habitual: undefined,
    primera: params.primeraVivienda,
    edad: params.edad,
    gradoDiscapacidad: params.porcentajeDiscapacidad,
    hijos: params.numHijos,
    hipoteca: params.hipoteca,
    tasacion: params.tasacion,
    patrimonio: params.patrimonio,
    residenciaBaleares: params.residencia,
    proteccion: params.vpo ? ("sin-clasificar" as const) : ("libre" as const),
    // No IRPF mode, certificates or ownership checks in old calls: never infer them.
  };
  const detalle = calculatePurchaseTaxes(input);
  return {
    itp: detalle.total ?? Number.NaN,
    tipoAplicado:
      detalle.total !== null && detalle.fiscalBase > 0
        ? (detalle.total / detalle.fiscalBase) * 100
        : 0,
    descripcion: resultDescription(detalle, params.lang),
    detalle,
  };
}
