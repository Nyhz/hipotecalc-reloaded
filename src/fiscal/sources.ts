import type { Source } from "./types";

export const REVIEWED = "2026-09-06";
export const COVERAGE_FROM = "2026-01-01";
export const REGIONS = [
  ["andalucia", "Andalucía", "BOE-A-2021-17915"],
  ["aragon", "Aragón", "BOA-d-2005-90006"],
  ["asturias", "Asturias", "BOE-A-2015-945"],
  ["baleares", "Baleares", "BOE-A-2014-6925"],
  ["canarias", "Canarias", "BOC-j-2025-90249"],
  ["cantabria", "Cantabria", "BOCT-c-2008-90028"],
  ["castilla-la-mancha", "Castilla-La Mancha", "BOE-A-2014-1368"],
  ["castilla-y-leon", "Castilla y León", "BOCL-h-2013-90254"],
  ["cataluna", "Cataluña", "BOE-A-2024-6951"],
  ["comunidad-valenciana", "Comunidad Valenciana", "BOE-A-1998-8202"],
  ["extremadura", "Extremadura", "BOE-A-2018-8159"],
  ["galicia", "Galicia", "BOE-A-2011-18161"],
  ["madrid", "Madrid", "BOCM-m-2010-90068"],
  ["murcia", "Murcia", "BOE-A-2011-10542"],
  ["navarra", "Navarra", "BON-n-1999-90001"],
  [
    "pais-vasco",
    "País Vasco",
    "https://www.gipuzkoa.eus/es/web/ogasuna/impuestos/modelo/60t/tipos-impositivos",
  ],
  ["la-rioja", "La Rioja", "BOE-A-2017-13750"],
  ["ceuta", "Ceuta", "BOE-A-1993-25359"],
  ["melilla", "Melilla", "BOE-A-1993-25359"],
] as const;

export function regionId(value: string): string {
  return (
    REGIONS.find(([id, name]) => value === id || value === name)?.[0] ?? value
  );
}
export function source(
  region: string,
  article: string,
  override?: string,
): Source {
  const row = REGIONS.find(([id]) => id === region);
  const ref = override ?? row?.[2] ?? "BOE-A-1993-25359";
  return {
    title: ref.startsWith("http")
      ? `Administración tributaria · ${row?.[1] ?? "España"}`
      : ref,
    url: ref.startsWith("http")
      ? ref
      : `https://www.boe.es/buscar/act.php?id=${ref}`,
    article,
    checked: REVIEWED,
  };
}
