import type { ReactNode } from 'react';
import type { Lang } from '../../analytics/routes';
import { directionLabel, nextRankingSort, sortLabels, type RankingSort, type SortKey } from '../../analytics/sorting';

interface Props {
  column: SortKey;
  sort: RankingSort;
  onSort: (sort: RankingSort) => void;
  lang: Lang;
  children: ReactNode;
}

export default function SortHeader({column, sort, onSort, lang, children}: Props) {
  const active = sort.key === column;
  const next = nextRankingSort(sort, column);
  return <th scope="col" className={column === 'name' ? 'an-col-municipality' : undefined}
    aria-sort={active ? sort.direction === 'asc' ? 'ascending' : 'descending' : undefined}>
    <button type="button" className="an-sort-button" onClick={()=>onSort(next)}
      aria-label={`${lang === 'es' ? 'Ordenar por' : 'Sort by'} ${sortLabels(lang)[column]}: ${directionLabel(next.direction,lang)}`}>
      <span>{children}</span><span aria-hidden="true" className="an-sort-arrow">{active ? sort.direction === 'asc' ? '↑' : '↓' : '↕'}</span>
    </button>
  </th>;
}
