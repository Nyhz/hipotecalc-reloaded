import { summary, format, quarterLabel, type Snapshot } from './model';
import type { Lang } from './routes';
const escape = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export function chartSVG(q: string, lang: Lang, source: Snapshot) {
  const en = lang === 'en', s=summary(q,source), top=s.rows.slice(0,6);
  const max=Math.ceil(top[0].index/2)*2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img"><title>${en?'Estimated home purchase effort':'Esfuerzo de compra estimado'} · ${q}</title>
  <rect width="1200" height="630" fill="#f8fafc"/><rect width="1200" height="142" fill="#142738"/>
  <text x="46" y="40" font-family="Arial,sans-serif" font-size="17" letter-spacing="2" fill="#d8f381">HIPOTECALC ANALYTICS / IHEC</text>
  <text x="46" y="86" font-family="Arial,sans-serif" font-size="31" font-weight="bold" fill="white">${en?'Where buying a home takes more income':'Dónde comprar vivienda exige más renta'}</text>
  <text x="46" y="119" font-family="Arial,sans-serif" font-size="17" fill="#cfdae6">${quarterLabel(q,lang)} · ${en?'Six highest ratios among 100 municipalities':'Seis mayores cocientes entre 100 municipios'}</text>
  ${[0,1,2,3,4].map(i=>`<line x1="${350+i*190}" y1="174" x2="${350+i*190}" y2="470" stroke="#dbe3ed"/><text x="${350+i*190}" y="493" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#516278">${format(max*i/4,lang,1)}×</text>`).join('')}
  ${top.map((r,i)=>`<text x="46" y="${201+i*49}" font-family="Arial,sans-serif" font-size="20" fill="#24394f">${escape(r.name)}</text><rect x="350" y="${179+i*49}" width="${r.index/max*760}" height="31" rx="3" fill="${i===0?'#255ed4':'#7c9ac8'}"/><text x="${350+r.index/max*760+9}" y="${201+i*49}" font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="#24394f">${format(r.index,lang)}×</text>`).join('')}
  <text x="46" y="535" font-family="Arial,sans-serif" font-size="16" fill="#364c62">${en?'Asking price of 80 m² / estimated annual household income. Not years of saving.':'Precio ofertado de 80 m² / renta anual estimada del hogar. No son años de ahorro.'}</text>
  <text x="46" y="566" font-family="Arial,sans-serif" font-size="14" fill="#516278">${en?'Source: Hipotecalc estimates using Idealista and INE.':'Fuente: estimación de Hipotecalc con Idealista e INE.'}</text>
  <text x="1150" y="600" text-anchor="end" font-family="Arial,sans-serif" font-size="17" font-weight="bold" fill="#255ed4">hipotecalc.com</text></svg>`;
}
