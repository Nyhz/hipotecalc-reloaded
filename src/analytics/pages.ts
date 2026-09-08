import { base, hub, methodPath, pilotCities, reportPath, reportsPath, type Lang } from './routes';
import { latestQuarter, reportQuarters } from './model';
export type PageKind = 'hub' | 'indicator' | 'methodology' | 'archive' | 'report' | 'city';
export interface AnalyticsPage { kind: PageKind; lang: Lang; quarter?: string; cityCode?: string; path: string }
export function pages(lang: Lang): AnalyticsPage[] {
  return [
    {kind:'hub',lang,path:hub(lang)}, {kind:'indicator',lang,path:base(lang)},
    {kind:'methodology',lang,path:methodPath(lang)}, {kind:'archive',lang,path:reportsPath(lang)},
    ...Object.entries(pilotCities).map(([slug,cityCode])=>({kind:'city' as const,lang,path:`${base(lang)}/${slug}`,cityCode,quarter:latestQuarter})),
    ...reportQuarters.map(quarter=>({kind:'report' as const,lang,quarter,path:reportPath(quarter,lang)})),
  ];
}
