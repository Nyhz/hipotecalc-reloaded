import snapshot from '../data/analytics/2026-09-07-v1.json';
import editions from '../data/analytics/reports.json';
import { SITE, base, hub, reportPath, type Lang } from './routes';
import { quarterLabel, change, observation, median, previousQuarter } from './metrics';
export { quarterLabel, format, percent, change, observation, median, previousQuarter } from './metrics';

export interface Observation {
  quarter: string; monthlyPrices: (number | null)[]; price: number | null;
  priceMonths: number; income: number | null; index: number | null;
}
export interface City {
  code: string; name: string; province: string; region: string; population: number;
  income2023: number; sourcePrice: string; observations: Observation[];
}
export interface Snapshot {
  version: string; methodologyVersion: string; sourceCutoff: string;
  publishedAt: string; modifiedAt: string; workbookSha256: string;
  referenceArea: number; populationYear: number; incomeBaseYear: number;
  cities: City[]; factors: typeof snapshot.factors; backtest: typeof snapshot.backtest;
}
export const data: Snapshot = snapshot;
export const versions: Record<string, Snapshot> = { [data.version]: data };
export const reportQuarters = Object.keys(editions).sort();
export const title = (lang: Lang) => lang === 'es' ? 'Índice Hipotecalc de Esfuerzo de Compra' : 'Hipotecalc Home Purchase Effort Index';
export const dateLabel = (date: string, lang: Lang) => new Date(date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'});
export const completeQuarters = (source: Snapshot = data) => source.factors.map(f => f.quarter).filter(q => source.cities.every(c => { const o = observation(c, q); return o?.index !== null && o?.index !== undefined && o.priceMonths === 3; }));
export const latestQuarter = completeQuarters().at(-1)!;
export function ranking(q: string, source: Snapshot = data) {
  return source.cities.flatMap(city => {
    const o = observation(city, q);
    if (!o || o.index === null || o.priceMonths !== 3) return [];
    return [{ ...city, ...o, index: o.index, qoq: change(o.index, observation(city, previousQuarter(q))?.index ?? null), yoy: change(o.index, observation(city, previousQuarter(q, true))?.index ?? null) }];
  }).sort((a,b) => b.index - a.index || a.code.localeCompare(b.code)).map((row, i) => ({ ...row, rank: i + 1 }));
}
export function summary(q: string, source: Snapshot = data) {
  const rows = ranking(q, source), prior = ranking(previousQuarter(q), source), year = ranking(previousQuarter(q, true), source);
  const mid = median(rows.map(r => r.index));
  return { rows, median: mid, leader: rows[0], lowest: rows.at(-1)!,
    qoq: prior.length === rows.length ? change(mid, median(prior.map(r => r.index))) : null,
    yoy: year.length === rows.length ? change(mid, median(year.map(r => r.index))) : null,
    increases: rows.filter(r => r.qoq !== null && r.qoq > 1e-10).length,
    decreases: rows.filter(r => r.qoq !== null && r.qoq < -1e-10).length,
    fastest: [...rows].filter(r => r.qoq !== null).sort((a,b) => b.qoq! - a.qoq!)[0] ?? null,
    largestFall: [...rows].filter(r => r.qoq !== null && r.qoq < 0).sort((a,b) => a.qoq! - b.qoq!)[0] ?? null,
  };
}
export function reportSource(q: string): Snapshot {
  const version = editions[q as keyof typeof editions];
  if (!version || !versions[version]) throw new Error(`No released edition for ${q}`);
  const source = versions[version];
  if (!completeQuarters(source).includes(q)) throw new Error(`Incomplete report ${q}`);
  return source;
}
export const sources = [
  {name:'Idealista · precios ofertados / asking prices', url:'https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/'},
  {name:'INE · ADRH · renta municipal / municipal income', url:'https://www.ine.es/jaxiT3/Tabla.htm?t=30824'},
  {name:'INE · ECV · renta nacional / national income', url:'https://www.ine.es/jaxiT3/Tabla.htm?t=9949'},
  {name:'INE · CTNFSI · saldos contables / sector accounts', url:'https://www.ine.es/jaxiT3/Tabla.htm?t=62275'},
  {name:'INE · ECP · hogares / households', url:'https://www.ine.es/jaxiT3/Tabla.htm?t=60135'},
];
export const asset = (quarter: string, lang: Lang, source: Snapshot = data) => `/img/analytics/${source.version}/${lang}/${quarter.toLowerCase()}.png`;
export const downloadPath = (lang: Lang, quarter = 'all', version = data.version) => `/analytics/datos/${version}/${lang}/${quarter.toLowerCase()}.csv`;
export function datasetSchema(lang: Lang, source = data, quarter?: string) {
  const url = SITE + (quarter ? reportPath(quarter, lang) : base(lang));
  const periods = quarter ? [quarter] : completeQuarters(source);
  const start = `${periods[0].slice(0,4)}-${String(Number(periods[0].slice(-1))*3-2).padStart(2,'0')}-01`;
  const last = periods.at(-1)!, end = new Date(Date.UTC(Number(last.slice(0,4)),Number(last.slice(-1))*3,0)).toISOString().slice(0,10);
  return { '@context':'https://schema.org', '@type':'Dataset', '@id':`${url}#dataset`, url,
    name: `${title(lang)}${quarter ? ` · ${quarterLabel(quarter,lang)}` : ''}`,
    description: lang === 'es' ? 'Precio ofertado de 80 m² dividido entre renta anual estimada del hogar en 100 municipios españoles. Estimación de Hipotecalc; no es esfuerzo hipotecario ni años de ahorro.' : 'Asking price of an 80 m² home divided by estimated annual household income in 100 Spanish municipalities. A Hipotecalc estimate, not mortgage payment burden or years of saving.',
    creator:{'@id':`${SITE}/#organization`}, publisher:{'@id':`${SITE}/#organization`},
    datePublished: source.publishedAt, dateModified: source.modifiedAt, version:source.version,
    identifier:`IHEC:${source.version}:${quarter ?? 'series'}`, inLanguage:lang,
    temporalCoverage:`${start}/${end}`, spatialCoverage:{'@type':'Place',name:lang === 'es' ? '100 municipios de España (muestra fija, población 2025)' : '100 Spanish municipalities (fixed sample, 2025 population)'},
    variableMeasured:{'@type':'PropertyValue',name:title(lang), unitText:lang === 'es' ? 'veces la renta anual estimada del hogar' : 'multiples of estimated annual household income'},
    measurementTechnique: `${SITE}${base(lang)}/${lang === 'es' ? 'metodologia' : 'methodology'}`,
    isAccessibleForFree:true, includedInDataCatalog:{'@id':`${SITE}${hub(lang)}#catalog`},
    isBasedOn:sources.map(s=>({'@type':'CreativeWork',name:s.name,url:s.url})),
    distribution:{'@type':'DataDownload',encodingFormat:'text/csv',contentUrl:SITE+downloadPath(lang,quarter,source.version)},
  };
}
export function csv(lang: Lang, source: Snapshot, quarter?: string) {
  const headers = lang === 'es' ? ['codigo_ine','municipio','trimestre','ihec_estimado','puesto','variacion_trimestral','variacion_interanual','version','metodologia','fecha_corte','autor','url_metodologia','fuentes','unidad_variaciones'] : ['ine_code','municipality','quarter','estimated_ihec','rank','quarterly_change','annual_change','version','methodology','source_cutoff','creator','methodology_url','sources','change_unit'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g,'""')}"`;
  const rows = (quarter ? [quarter] : completeQuarters(source)).flatMap(q => ranking(q,source).map(r => [r.code,r.name,q,r.index,r.rank,r.qoq,r.yoy,source.version,source.methodologyVersion,source.sourceCutoff,'Equipo Hipotecalc',`${SITE}${base(lang)}/${lang === 'es' ? 'metodologia' : 'methodology'}`,sources.map(s=>s.url).join(' | '),lang === 'es'?'proporción: 0.01 = 1 %':'ratio: 0.01 = 1 %']));
  return '\uFEFF' + [headers,...rows].map(r => r.map(esc).join(',')).join('\r\n') + '\r\n';
}
