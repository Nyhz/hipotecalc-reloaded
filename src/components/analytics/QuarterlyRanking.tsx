import { useState } from 'react';
import { cityPath, type Lang } from '../../analytics/routes';
import { format, percent, quarterLabel } from '../../analytics/metrics';
import { initialRankingSort, sortRankingRows, type SortableRankingRow } from '../../analytics/sorting';
import SortHeader from './SortHeader';

interface Props { rows: SortableRankingRow[]; quarter: string; lang: Lang }
export default function QuarterlyRanking({ rows, quarter, lang }: Props) {
  const [sort, setSort] = useState(initialRankingSort);
  const en = lang === 'en';
  const header = {sort, onSort:setSort, lang};
  return <>
    <p className="an-small">{en?'Click a column heading to sort. The arrow indicates the direction; ranks stay unchanged.':'Pulsa una cabecera para ordenar. La flecha indica el sentido; los puestos originales se mantienen.'}</p>
    <div className="an-table-scroll" tabIndex={0} role="region" aria-label={en?'Quarterly ranking':'Ranking trimestral'}>
      <table>
        <caption>{quarterLabel(quarter,lang)} · IHEC · {en?'Estimated annual income multiples':'Veces la renta anual estimada'}</caption>
        <thead><tr>
          <SortHeader {...header} column="rank">#</SortHeader>
          <SortHeader {...header} column="name">{en?'Municipality':'Municipio'}</SortHeader>
          <SortHeader {...header} column="index">IHEC</SortHeader>
          <SortHeader {...header} column="qoq">{en?'QoQ change':'Var. trimestral'}</SortHeader>
          <SortHeader {...header} column="yoy">{en?'Year-on-year':'Interanual'}</SortHeader>
        </tr></thead>
        <tbody>{sortRankingRows(rows,sort,lang).map(r=><tr key={r.code}>
          <td>{r.rank}</td>
          <th scope="row">{cityPath(r.code,lang)?<a href={cityPath(r.code,lang)!}>{r.name}</a>:r.name}</th>
          <td>{format(r.index,lang)}</td><td>{percent(r.qoq,lang)}</td><td>{percent(r.yoy??null,lang)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </>;
}
