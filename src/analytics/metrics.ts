import type { City } from './model';
import type { Lang } from './routes';
export const quarterLabel = (q: string, lang: Lang) => lang === 'es' ? `${q.slice(0,4)}T${q.slice(-1)}` : `${q.slice(-2)} ${q.slice(0,4)}`;
export const format = (n: number | null, lang: Lang, digits = 2) => n === null ? (lang === 'es' ? 'No disponible' : 'Unavailable') : n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const percent = (n: number | null, lang: Lang) => n === null ? '—' : `${n > 0 ? '+' : ''}${format(n * 100, lang, 1)} %`;
export const change = (current: number | null, previous: number | null) => current !== null && previous !== null && previous > 0 ? current / previous - 1 : null;
export const observation = (city: City, q: string) => city.observations.find(o => o.quarter === q);
export function median(values: number[]) {
  if (!values.length) throw new Error('Cannot calculate a median without observations');
  const sorted = [...values].sort((a,b) => a-b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle-1] + sorted[middle]) / 2;
}
export function previousQuarter(q: string, yearsBack = false) {
  const y = Number(q.slice(0,4)), n = Number(q.slice(-1));
  return yearsBack ? `${y-1}Q${n}` : n === 1 ? `${y-1}Q4` : `${y}Q${n-1}`;
}
