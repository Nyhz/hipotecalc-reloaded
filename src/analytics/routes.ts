export type Lang = 'es' | 'en';
export const SITE = 'https://www.hipotecalc.com';
export const pilotCities = { madrid: '28079', barcelona: '08019', marbella: '29069' } as const;
export const hub = (lang: Lang) => lang === 'es' ? '/analytics' : '/en/analytics';
export const base = (lang: Lang) => `${hub(lang)}/${lang === 'es' ? 'indice-esfuerzo-compra' : 'house-price-to-income'}`;
export const methodPath = (lang: Lang) => `${base(lang)}/${lang === 'es' ? 'metodologia' : 'methodology'}`;
export const reportsPath = (lang: Lang) => `${base(lang)}/${lang === 'es' ? 'informes' : 'reports'}`;
export const reportPath = (quarter: string, lang: Lang) => `${reportsPath(lang)}/${quarter.toLowerCase().replace('q', lang === 'es' ? '-t' : '-q')}`;
export const cityPath = (code: string, lang: Lang) => {
  const entry = Object.entries(pilotCities).find(([, value]) => value === code);
  return entry ? `${base(lang)}/${entry[0]}` : null;
};
export function analyticsAlternate(path: string): string | null {
  const lang: Lang = path.startsWith('/en/') ? 'en' : 'es';
  const other: Lang = lang === 'es' ? 'en' : 'es';
  if (path === hub(lang)) return hub(other);
  if (path === base(lang)) return base(other);
  if (path === methodPath(lang)) return methodPath(other);
  if (path === reportsPath(lang)) return reportsPath(other);
  if (Object.keys(pilotCities).some(slug => path === `${base(lang)}/${slug}`)) return path.replace(base(lang), base(other));
  const match = path.match(new RegExp(`^${reportsPath(lang)}/(\\d{4})-[tq]([1-4])$`));
  return match ? reportPath(`${match[1]}Q${match[2]}`, other) : null;
}
