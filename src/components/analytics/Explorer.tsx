import { useId, useState } from 'react';
import type { City } from '../../analytics/model';
import { change, cityPath, format, median, observation, percent, previousQuarter, quarterLabel } from '../../analytics/client';
import type { Lang } from '../../analytics/routes';
import { directionLabel, initialRankingSort, sortLabels, sortRankingRows, type RankingSort, type SortDirection, type SortKey } from '../../analytics/sorting';
import SortHeader from './SortHeader';

interface Props { cities: City[]; quarters: string[]; lang: Lang; initialCity?: string; endQuarter: string; showRanking?: boolean }
export default function Explorer({ cities, quarters, lang, initialCity = '28079', endQuarter, showRanking = true }: Props) {
  const en = lang === 'en', id = useId();
  const [code, setCode] = useState(initialCity), [comparison, setComparison] = useState('');
  const [q, setQ] = useState(endQuarter), [search, setSearch] = useState('');
  const [sort, setSort] = useState<RankingSort>(initialRankingSort), [point, setPoint] = useState(quarters.length - 1);
  const header = {sort, onSort:setSort, lang};
  const columns: SortKey[] = ['rank','name','index','price','income','qoq'];
  const city = cities.find(c=>c.code === code)!;
  const other = cities.find(c=>c.code === comparison);
  const values = quarters.map(quarter=>observation(city,quarter)?.index ?? 0);
  const otherValues = other ? quarters.map(quarter=>observation(other,quarter)?.index ?? 0) : [];
  const medians = quarters.map(quarter=>median(cities.map(c=>observation(c,quarter)!.index!)));
  const max = Math.max(2,Math.ceil(Math.max(...values,...medians,...otherValues)/2)*2);
  const x = (i: number) => 54 + i * 670 / Math.max(quarters.length-1,1);
  const y = (v: number) => 238 - v / max * 206;
  const path = (v: number[]) => v.map((n,i)=>`${x(i)},${y(n)}`).join(' ');
  const safePoint = Math.min(point,quarters.length-1), current = quarters[safePoint];
  const normalize = (s: string)=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const all = cities.map(c=>({city:c,o:observation(c,q)!})).filter(r=>r.o.index !== null)
    .sort((a,b)=>b.o.index!-a.o.index! || a.city.code.localeCompare(b.city.code))
    .map((r,i)=>{const delta=change(r.o.index,observation(r.city,previousQuarter(q))?.index ?? null);return {...r,rank:i+1,delta,qoq:delta,code:r.city.code,name:r.city.name,index:r.o.index!,price:r.o.price===null?null:r.o.price*80,income:r.o.income};});
  const rows = sortRankingRows(all.filter(r=>normalize(`${r.city.name} ${r.city.province}`).includes(normalize(search))),sort,lang);
  return <div className="analytics-explorer">
    <section className="an-panel" aria-labelledby={`${id}-chart-title`}>
      <div className="an-panel-top"><div><p className="an-kicker">{en?'EXPLORE THE SERIES':'EXPLORA LA SERIE'}</p><h2 id={`${id}-chart-title`}>{en?'The path to buying a home':'Cómo evoluciona el esfuerzo de compra'}</h2></div><span className="an-badge">2023 — {endQuarter.slice(0,4)}</span></div>
      <div className="an-controls">
        <label htmlFor={`${id}-city`}>{en?'Municipality':'Municipio'}<select id={`${id}-city`} value={code} onChange={e=>{setCode(e.target.value);if(e.target.value===comparison)setComparison('');}}>{[...cities].sort((a,b)=>a.name.localeCompare(b.name,lang)).map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select></label>
        <label htmlFor={`${id}-compare`}>{en?'Compare with':'Comparar con'}<select id={`${id}-compare`} value={comparison} onChange={e=>setComparison(e.target.value)}><option value="">{en?'Sample median only':'Solo mediana de la muestra'}</option>{[...cities].sort((a,b)=>a.name.localeCompare(b.name,lang)).filter(c=>c.code!==code).map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select></label>
      </div>
      <p className="an-unit">{en?'Multiples of estimated annual household income · lower means less relative effort':'Veces la renta anual estimada del hogar · menor valor, menor esfuerzo relativo'}</p>
      <svg viewBox="0 0 760 280" className="an-chart" role="img" aria-labelledby={`${id}-svg-title`}>
        <title id={`${id}-svg-title`}>{`${en?'Estimated home purchase effort':'Esfuerzo de compra estimado'}: ${city.name}. ${en?'Data table below the chart.':'Tabla de datos bajo el gráfico.'}`}</title>
        {[0,1,2,3,4].map(i=><g key={i}><line x1="54" y1={y(max*i/4)} x2="724" y2={y(max*i/4)} stroke="#e1e5e9"/><text x="44" y={y(max*i/4)+4} textAnchor="end" fill="#536376" fontSize="11">{format(max*i/4,lang,1)}</text></g>)}
        <polyline points={path(medians)} fill="none" stroke="#7b8796" strokeWidth="2" strokeDasharray="6 5"/>
        {other&&<polyline points={path(otherValues)} fill="none" stroke="#ad5a31" strokeWidth="2.5"/>}
        <polyline points={path(values)} fill="none" stroke="#255ed4" strokeWidth="3" strokeLinejoin="round"/>
        {quarters.map((quarter,i)=><g key={quarter}>
          {(i===0||i===quarters.length-1||i%4===0)&&<text x={x(i)} y="266" textAnchor="middle" fontSize="11" fill="#536376">{quarterLabel(quarter,lang)}</text>}
          <circle cx={x(i)} cy={y(values[i])} r={i===safePoint?6:4} fill="#255ed4" stroke="white" strokeWidth="2"/>
          <rect x={x(i)-14} y="24" width="28" height="218" fill="transparent" onMouseEnter={()=>setPoint(i)} onClick={()=>setPoint(i)}><title>{`${quarterLabel(quarter,lang)}: ${format(values[i],lang)}×`}</title></rect>
        </g>)}
      </svg>
      <div className="an-legend"><span><i style={{background:'#255ed4'}}/>{city.name}</span><span><i style={{background:'#7b8796'}}/>{en?'Median of 100 municipalities':'Mediana de 100 municipios'}</span>{other&&<span><i style={{background:'#ad5a31'}}/>{other.name}</span>}</div>
      <label className="an-scrubber" htmlFor={`${id}-quarter`}>{en?'Explore a quarter (keyboard or touch)':'Explorar trimestre (teclado o táctil)'}<input id={`${id}-quarter`} type="range" min="0" max={Math.max(quarters.length-1,0)} value={safePoint} onChange={e=>setPoint(Number(e.target.value))} aria-valuetext={quarterLabel(current,lang)}/></label>
      <output className="an-readout" aria-live="polite"><span>{quarterLabel(current,lang)}</span><strong>{city.name}: {format(values[safePoint],lang)}×</strong><span>{en?'Median':'Mediana'}: {format(medians[safePoint],lang)}×</span>{other&&<span>{other.name}: {format(otherValues[safePoint],lang)}×</span>}</output>
      <details className="an-details"><summary>{en?'Read the chart as a table':'Ver los datos del gráfico en una tabla'}</summary><div className="an-table-scroll"><table><caption>{en?'Historical series, income multiples':'Serie histórica, múltiplos de renta'}</caption><thead><tr><th>{en?'Quarter':'Trimestre'}</th><th>{city.name}</th><th>{en?'Median':'Mediana'}</th>{other&&<th>{other.name}</th>}</tr></thead><tbody>{quarters.map((quarter,i)=><tr key={quarter}><th scope="row">{quarterLabel(quarter,lang)}</th><td>{format(values[i],lang)}</td><td>{format(medians[i],lang)}</td>{other&&<td>{format(otherValues[i],lang)}</td>}</tr>)}</tbody></table></div></details>
    </section>
    {showRanking&&<section id="ranking" className="an-panel" aria-labelledby={`${id}-ranking`}>
      <div className="an-panel-top"><div><p className="an-kicker">{en?'100 MUNICIPALITIES':'100 MUNICIPIOS'}</p><h2 id={`${id}-ranking`}>{en?'Home purchase effort ranking':'Ranking de esfuerzo de compra'}</h2></div><span className="an-badge">{quarterLabel(q,lang)}</span></div>
      <div className="an-controls an-controls-three">
        <label htmlFor={`${id}-search`}>{en?'Find a municipality or province':'Buscar municipio o provincia'}<input id={`${id}-search`} type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder={en?'e.g. Madrid':'Ej. Madrid'}/></label>
        <label htmlFor={`${id}-period`}>{en?'Quarter':'Trimestre'}<select id={`${id}-period`} value={q} onChange={e=>setQ(e.target.value)}>{[...quarters].reverse().map(p=><option key={p} value={p}>{quarterLabel(p,lang)}</option>)}</select></label>
        <label htmlFor={`${id}-sort`}>{en?'Order':'Orden'}<select id={`${id}-sort`} value={`${sort.key}:${sort.direction}`} onChange={e=>{const [key,direction]=e.target.value.split(':');setSort({key:key as SortKey,direction:direction as SortDirection});}}>{columns.flatMap(key=>(['asc','desc'] as const).map(direction=><option key={`${key}:${direction}`} value={`${key}:${direction}`}>{sortLabels(lang)[key]} · {directionLabel(direction,lang)}</option>))}</select></label>
      </div>
      <p className="an-small" aria-live="polite">{rows.length} {en?'of 100 municipalities. Rank 1 = highest effort.':'de 100 municipios. Puesto 1 = mayor esfuerzo.'}</p>
      <div className="an-table-scroll" tabIndex={0} role="region" aria-label={en?'Ranking table':'Tabla del ranking'}><table className="an-ranking"><caption>{en?'IHEC · asking prices and estimated household income':'IHEC · precios ofertados y renta estimada del hogar'} · {quarterLabel(q,lang)}</caption><thead><tr><SortHeader {...header} column="rank">#</SortHeader><SortHeader {...header} column="name">{en?'Municipality':'Municipio'}</SortHeader><SortHeader {...header} column="index">IHEC <small>(×)</small></SortHeader><SortHeader {...header} column="price">80 m² (€)</SortHeader><SortHeader {...header} column="income">{en?'Income/year (€)':'Renta/año (€)'}</SortHeader><SortHeader {...header} column="qoq">{en?'QoQ':'Var. trim.'}</SortHeader></tr></thead><tbody>{rows.map(({city:c,o,rank,delta})=><tr key={c.code}><td>{rank}</td><th scope="row">{cityPath(c.code,lang)?<a href={cityPath(c.code,lang)!}>{c.name}</a>:c.name}<small>{c.province}</small></th><td><strong>{format(o.index,lang)}</strong></td><td>{format(o.price!*80,lang,0)}</td><td>{format(o.income,lang,0)}</td><td className={delta===null?'':delta>0?'an-up':delta<0?'an-down':''}>{percent(delta,lang)}</td></tr>)}</tbody></table></div>
      {rows.length===0&&<p>{en?'No matching municipalities. Try another name.':'No se han encontrado municipios. Prueba otro nombre.'}</p>}
      <p className="an-small">{en?'Estimated annual household income, not quarterly income. Changes are calculated from unrounded index values. Ties are ordered by INE code.':'Renta anual estimada del hogar, no renta trimestral. Variaciones calculadas con el índice sin redondear. Desempates por código INE.'}</p>
    </section>}
  </div>;
}
