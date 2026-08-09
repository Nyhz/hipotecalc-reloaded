// ---------------------------------------------------------------------------
// Fuente única de verdad de autoría (E-E-A-T). Todo lo que muestre o marque
// autores/revisores (bylines, páginas de entidad, JSON-LD) consume de aquí.
// Los datos personales y credenciales los aporta el propietario del sitio:
// no añadir credenciales, perfiles ni biografías no verificadas.
// ---------------------------------------------------------------------------

const SITE_BASE = 'https://www.hipotecalc.com'

export type AuthorId = 'equipo' | 'jose-perales'
export type Lang = 'es' | 'en'

export interface Author {
  id: AuthorId
  tipo: 'person' | 'organization'
  nombre: string
  cargo: Record<Lang, string>
  bio: Record<Lang, string>
  /** Ruta pública de la imagen (p. ej. /autores/jose-perales.jpg). Sin foto → undefined. */
  imagen?: string
  sameAs: string[]
  credenciales?: {
    texto: Record<Lang, string>
    /** Nº de registro verificable (p. ej. registro de intermediarios del Banco de España) */
    registro?: string
  }
  /** Ruta de la página de entidad en cada idioma */
  pagina: Record<Lang, string>
  /** @id estable para JSON-LD */
  schemaId: string
  knowsAbout: Record<Lang, string[]>
}

export const AUTORES: Record<AuthorId, Author> = {
  'jose-perales': {
    id: 'jose-perales',
    tipo: 'person',
    nombre: 'José Perales',
    cargo: {
      es: 'Asesor hipotecario · Intermediario de crédito inmobiliario',
      en: 'Mortgage advisor · Real estate credit intermediary',
    },
    bio: {
      es: 'José Perales es asesor hipotecario e intermediario de crédito inmobiliario inscrito en el registro del Banco de España con el número E286. Acompaña a compradores en la búsqueda, comparación y negociación de su hipoteca, y firma los contenidos financieros de Hipotecalc.',
      en: "José Perales is a mortgage advisor and real estate credit intermediary registered with the Bank of Spain under number E286. He helps buyers find, compare and negotiate their mortgage, and authors Hipotecalc's financial content.",
    },
    // Foto pendiente de que el propietario aporte el fichero
    imagen: undefined,
    sameAs: [
      'https://www.linkedin.com/in/joseperalesbh/',
      'https://www.instagram.com/joseperalesbh/',
      'https://www.tiktok.com/@joseperalesbh',
      'https://cal.com/jose-perales-asesor/Hr8YvL',
    ],
    credenciales: {
      texto: {
        es: 'Intermediario de crédito inmobiliario inscrito en el registro del Banco de España · nº E286',
        en: 'Real estate credit intermediary registered with the Bank of Spain · no. E286',
      },
      registro: 'E286',
    },
    pagina: { es: '/autores/jose-perales', en: '/en/authors/jose-perales' },
    schemaId: `${SITE_BASE}/autores/jose-perales#person`,
    knowsAbout: {
      es: ['Hipotecas', 'Crédito inmobiliario', 'Financiación de vivienda en España'],
      en: ['Mortgages', 'Real estate credit', 'Home financing in Spain'],
    },
  },
  equipo: {
    id: 'equipo',
    tipo: 'organization',
    nombre: 'Equipo Hipotecalc',
    cargo: {
      es: 'Redacción y desarrollo de Hipotecalc',
      en: 'Hipotecalc editorial and development team',
    },
    bio: {
      es: 'Hipotecalc está hecho por un equipo de dos personas, Dani y Carlos: un desarrollador y un experto financiero con amplia carrera en fintech. Construyen las calculadoras y elaboran los contenidos del sitio a partir de fuentes oficiales.',
      en: 'Hipotecalc is built by a two-person team, Dani and Carlos: a developer and a finance expert with a long fintech career. They build the calculators and produce the site’s content from official sources.',
    },
    imagen: '/logo-512.png',
    // Sin perfiles públicos de marca por ahora
    sameAs: [],
    pagina: { es: '/sobre-nosotros', en: '/en/about' },
    // El Equipo ES la Organization del sitio: mismo @id que define Layout.astro
    schemaId: `${SITE_BASE}/#organization`,
    knowsAbout: {
      es: ['Hipotecas', 'Euríbor', 'Impuestos de compraventa de vivienda'],
      en: ['Mortgages', 'Euribor', 'Spanish property purchase taxes'],
    },
  },
}

// ---------------------------------------------------------------------------
// Defaults de autoría por tipo de contenido (Tarea: configurable por página —
// el frontmatter `author` / `reviewedBy` sobrescribe estos valores).
// `reviewedBy: 'none'` en frontmatter elimina el revisor explícitamente.
// ---------------------------------------------------------------------------

export type TipoContenido = 'blog' | 'guia' | 'itp' | 'calculadora' | 'legal'

const DEFAULTS: Record<TipoContenido, { author: AuthorId; reviewedBy: AuthorId | null }> = {
  blog: { author: 'jose-perales', reviewedBy: null },
  guia: { author: 'jose-perales', reviewedBy: null },
  itp: { author: 'jose-perales', reviewedBy: null },
  calculadora: { author: 'equipo', reviewedBy: 'jose-perales' },
  legal: { author: 'equipo', reviewedBy: null },
}

export interface Autoria {
  autor: Author
  revisor: Author | null
}

/** Resuelve autor y revisor de una página: frontmatter > default del tipo. */
export function resolverAutoria(
  tipo: TipoContenido,
  fm?: { author?: string; reviewedBy?: string }
): Autoria {
  const def = DEFAULTS[tipo]
  const autorId = (fm?.author as AuthorId) || def.author
  const revisorRaw = fm?.reviewedBy ?? def.reviewedBy
  const revisor = revisorRaw && revisorRaw !== 'none' ? AUTORES[revisorRaw as AuthorId] : null
  return { autor: AUTORES[autorId], revisor }
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

/** Referencia mínima por @id para usar en author/reviewedBy de Article/BlogPosting. */
export function refSchema(a: Author, lang: Lang) {
  return {
    '@type': a.tipo === 'person' ? 'Person' : 'Organization',
    '@id': a.schemaId,
    name: a.nombre,
    url: `${SITE_BASE}${a.pagina[lang]}`,
  }
}

/** Definición completa de Person — usar SOLO en su página de entidad. */
export function personSchemaCompleto(a: Author, lang: Lang) {
  if (a.tipo !== 'person') throw new Error('personSchemaCompleto: la entidad no es una persona')
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': a.schemaId,
    name: a.nombre,
    url: `${SITE_BASE}${a.pagina[lang]}`,
    jobTitle: a.cargo[lang],
    description: a.bio[lang],
    ...(a.imagen ? { image: `${SITE_BASE}${a.imagen}` } : {}),
    sameAs: a.sameAs,
    knowsAbout: a.knowsAbout[lang],
    worksFor: { '@id': `${SITE_BASE}/#organization` },
    ...(a.credenciales
      ? {
          hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            name: a.credenciales.texto[lang],
            ...(a.credenciales.registro ? { identifier: a.credenciales.registro } : {}),
          },
        }
      : {}),
  }
}
