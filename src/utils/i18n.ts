import es from '../messages/es.json'
import en from '../messages/en.json'

const messages = {
  es,
  en
}

export type Language = 'es' | 'en'

export function t(key: string, lang: Language = 'es'): string {
  const keys = key.split('.')
  let value: any = messages[lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      console.warn(`Translation key not found: ${key} for language: ${lang}`)
      return key
    }
  }
  
  return typeof value === 'string' ? value : key
}

export function getCurrentLang(pathname: string): Language {
  // La home inglesa se sirve como '/en' (sin barra final) en producción
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return 'en'
  }
  return 'es'
}

export function getAlternateLang(currentLang: Language): Language {
  return currentLang === 'es' ? 'en' : 'es'
}

// Nombre en inglés de cada comunidad (las claves son los nombres exactos de
// src/constants/comunidades.ts, que no se traducen en datos ni frontmatter)
const REGION_EN: Record<string, string> = {
  'Andalucía': 'Andalusia',
  'Aragón': 'Aragon',
  'Baleares': 'Balearic Islands',
  'Canarias': 'Canary Islands',
  'Cataluña': 'Catalonia',
  'Comunidad Valenciana': 'Valencian Community',
  'Navarra': 'Navarre',
  'País Vasco': 'Basque Country',
}

export function regionNameEn(nombre: string): string {
  return REGION_EN[nombre] ?? nombre
}

// Normaliza a la forma canónica sin barra final (salvo la raíz), que es como
// sirve las URLs producción (vercel.json trailingSlash: false)
export function normalizePath(pathname: string): string {
  if (pathname === '/') return pathname
  return pathname.replace(/\/+$/, '')
}

// Pares estáticos ES ↔ EN. Las secciones de contenido (blog, guías, ITP) se
// emparejan por prefijo: el fichero inglés usa el MISMO slug que el español.
const RUTAS_ES_EN: Record<string, string> = {
  '/': '/en',
  '/calculadora-hipotecaria': '/en/mortgage-calculator',
  '/calculadora-alquiler': '/en/rental-calculator',
  '/calculadora-itp': '/en/itp-calculator',
  '/cuanto-me-prestan': '/en/how-much-can-i-borrow',
  '/comparativa-hipotecas': '/en/mortgage-comparison',
  '/euribor': '/en/euribor',
  '/guias': '/en/guides',
  '/itp': '/en/itp',
  '/blog': '/en/blog',
  '/aviso-legal': '/en/legal-notice',
  '/politica-de-privacidad': '/en/privacy-policy',
  '/politica-de-cookies': '/en/cookie-policy',
  '/disclaimer-financiero': '/en/financial-disclaimer',
}

const PREFIJOS_ES_EN: [string, string][] = [
  ['/blog/', '/en/blog/'],
  ['/guias/', '/en/guides/'],
  ['/itp/', '/en/itp/'],
]

// Los slugs ingleses están traducidos para las SERPs anglófonas. Al crear un
// contenido nuevo en ambos idiomas: si los slugs difieren, añade el par aquí;
// si son idénticos, no hace falta (el emparejado por prefijo lo cubre).
const SLUGS_ES_EN: Record<string, string> = {
  // blog
  'guerra-iran-euribor': 'iran-war-euribor',
  'tipos-de-hipoteca-fija-variable-mixta': 'mortgage-types-fixed-variable-mixed',
  'amortizar-cuota-o-plazo': 'pay-off-mortgage-reduce-payment-or-term',
  'euribor-junio-2026': 'euribor-june-2026',
  'quien-paga-ajd-hipoteca': 'who-pays-ajd-mortgage-stamp-duty',
  // guías
  'amortizacion-anticipada': 'early-mortgage-repayment',
  'gastos-compraventa': 'property-purchase-costs',
  'tin-vs-tae': 'tin-vs-apr',
  'avales-ico-hipoteca-joven': 'ico-mortgage-guarantee-young-buyers',
  'subrogacion-hipoteca': 'mortgage-subrogation',
  // ITP por comunidad
  'andalucia': 'andalusia',
  'baleares': 'balearic-islands',
  'canarias': 'canary-islands',
  'cataluna': 'catalonia',
  'comunidad-valenciana': 'valencian-community',
  'navarra': 'navarre',
  'pais-vasco': 'basque-country',
}

const SLUGS_EN_ES: Record<string, string> = Object.fromEntries(
  Object.entries(SLUGS_ES_EN).map(([es, en]) => [en, es])
)

export function getAlternatePath(pathname: string): string {
  const normalized = normalizePath(pathname)
  const currentLang = getCurrentLang(normalized)

  if (currentLang === 'es') {
    if (RUTAS_ES_EN[normalized]) return RUTAS_ES_EN[normalized]
    for (const [es, en] of PREFIJOS_ES_EN) {
      if (normalized.startsWith(es)) {
        const slug = normalized.slice(es.length)
        return en + (SLUGS_ES_EN[slug] ?? slug)
      }
    }
  } else {
    for (const [es, en] of Object.entries(RUTAS_ES_EN)) {
      if (en === normalized) return es
    }
    for (const [es, en] of PREFIJOS_ES_EN) {
      if (normalized.startsWith(en)) {
        const slug = normalized.slice(en.length)
        return es + (SLUGS_EN_ES[slug] ?? slug)
      }
    }
  }

  return pathname
}
