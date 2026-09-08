import type { APIRoute } from 'astro';
import { completeQuarters, csv, versions, type Snapshot } from '../../../../../analytics/model';
import type { Lang } from '../../../../../analytics/routes';
export function getStaticPaths() {
  return Object.values(versions).flatMap(source=>(['es','en'] as const).flatMap(lang=>['all',...completeQuarters(source)].map(quarter=>({params:{version:source.version,lang,file:quarter.toLowerCase()},props:{source,lang,quarter}}))));
}
export const GET: APIRoute = ({props}) => {
  const {source,lang,quarter}=props as {source:Snapshot;lang:Lang;quarter:string};
  return new Response(csv(lang,source,quarter==='all'?undefined:quarter),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="ihec-${quarter}-${source.version}-${lang}.csv"`,'X-Robots-Tag':'noindex'}});
};
