import type { Lang } from './routes';

export type SortKey = 'rank' | 'name' | 'index' | 'price' | 'income' | 'qoq' | 'yoy';
export type SortDirection = 'asc' | 'desc';
export interface RankingSort { key: SortKey; direction: SortDirection }
export interface SortableRankingRow {
  code: string;
  rank: number;
  name: string;
  index: number;
  price?: number | null;
  income?: number | null;
  qoq: number | null;
  yoy?: number | null;
}

export const initialRankingSort: RankingSort = { key: 'rank', direction: 'asc' };
export function nextRankingSort(current: RankingSort, key: SortKey): RankingSort {
  return { key, direction: current.key === key
    ? current.direction === 'asc' ? 'desc' : 'asc'
    : key === 'rank' || key === 'name' ? 'asc' : 'desc' };
}

/** Sort full-precision values, leave absent values last in either direction,
 * and preserve original ranks (sorting is only a presentation choice). */
export function sortRankingRows<T extends SortableRankingRow>(rows: readonly T[], sort: RankingSort, lang: Lang): T[] {
  const collator = new Intl.Collator(lang, { sensitivity: 'base' });
  return [...rows].sort((a, b) => {
    const left = a[sort.key], right = b[sort.key];
    const missingLeft = left == null || (typeof left === 'number' && !Number.isFinite(left));
    const missingRight = right == null || (typeof right === 'number' && !Number.isFinite(right));
    if (missingLeft !== missingRight) return missingLeft ? 1 : -1;
    let comparison = 0;
    if (!missingLeft && !missingRight) comparison = typeof left === 'string' && typeof right === 'string'
      ? collator.compare(left, right) : Number(left) - Number(right);
    return comparison * (sort.direction === 'asc' ? 1 : -1) || a.rank - b.rank || a.code.localeCompare(b.code);
  });
}

export const sortLabels = (lang: Lang): Record<SortKey, string> => lang === 'es'
  ? { rank:'Puesto', name:'Municipio', index:'IHEC', price:'Precio de 80 m²', income:'Renta anual', qoq:'Variación trimestral', yoy:'Variación interanual' }
  : { rank:'Rank', name:'Municipality', index:'IHEC', price:'80 m² price', income:'Annual income', qoq:'Quarterly change', yoy:'Year-on-year change' };
export const directionLabel = (direction: SortDirection, lang: Lang) => lang === 'es'
  ? direction === 'asc' ? 'ascendente' : 'descendente'
  : direction === 'asc' ? 'ascending' : 'descending';
