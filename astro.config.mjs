// @ts-check
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"
import compress from "astro-compress"
import sitemap from "@astrojs/sitemap"
import vercel from "@astrojs/vercel"
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"


import icon from "astro-icon"

import react from "@astrojs/react"
import keystatic from "@keystatic/astro"

// El panel de Keystatic (/keystatic) solo existe en desarrollo: el sitio de
// producción es 100% estático y los artículos se publican desde los .md del
// repo. Así evitamos necesitar SSR y la incompatibilidad peer con Astro 7.
const isDev = process.env.NODE_ENV !== "production"

// ---------------------------------------------------------------------------
// <lastmod> del sitemap: fechas fiables por tipo de página.
// - Contenido (blog/guías/ITP): updatedDate ?? pubDate del frontmatter.
// - Índices de sección: la fecha más reciente de sus hijos.
// - /euribor y las portadas: fecha de la última actualización del dato del
//   euríbor (se regenera cada mes con la Action).
// - /comparativa-hipotecas: FECHA_DATOS del fichero de ofertas.
// - Resto de páginas estáticas: fecha del último commit de su fichero fuente.
// ---------------------------------------------------------------------------
const MESES = { enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06', julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12' }

function frontmatterDate(path) {
  try {
    const fm = readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
    const d = fm.match(/^updatedDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1]
      ?? fm.match(/^pubDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1]
    return d ?? null
  } catch { return null }
}

function gitDate(path) {
  try {
    const out = execSync(`git log -1 --format=%cs -- "${path}"`, { encoding: 'utf8' }).trim()
    return out || null
  } catch { return null }
}

function buildLastmodMap() {
  /** @type {Record<string, string>} */
  const map = {}
  const addDir = (dir, rutaBase) => {
    let max = null
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const d = frontmatterDate(`${dir}/${f}`)
      if (!d) continue
      map[`${rutaBase}/${f.replace(/\.md$/, '')}`] = d
      if (!max || d > max) max = d
    }
    if (max) map[rutaBase] = max
  }
  addDir('src/content/blog', '/blog')
  addDir('src/content/en/blog', '/en/blog')
  addDir('src/content/guias', '/guias')
  addDir('src/content/en/guias', '/en/guides')
  addDir('src/content/guias/itp', '/itp')
  addDir('src/content/en/guias/itp', '/en/itp')

  // Euríbor: el periodo "YYYY-MM" es la media publicada a primeros del mes
  // siguiente, que es cuando cambió la página
  try {
    const periodo = readFileSync('src/constants/euribor-values.ts', 'utf8').match(/period:\s*"(\d{4})-(\d{2})"/)
    if (periodo) {
      const [_, y, m] = periodo
      const fecha = m === '12' ? `${Number(y) + 1}-01-01` : `${y}-${String(Number(m) + 1).padStart(2, '0')}-01`
      for (const ruta of ['/euribor', '/en/euribor']) map[ruta] = fecha
      // Las portadas muestran el dato del euríbor: cambian al menos cada mes
      const gitHome = gitDate('src/pages/index.astro')
      map['/'] = gitHome && gitHome > fecha ? gitHome : fecha
      map['/en'] = map['/']
    }
  } catch { /* sin dato, sin lastmod */ }

  // Comparativa: fecha de extracción de los datos ("13 de julio de 2026")
  try {
    const m = readFileSync('src/constants/hipotecas-bancos.ts', 'utf8').match(/FECHA_DATOS = '(\d{1,2}) de (\w+) de (\d{4})'/)
    if (m) {
      const fecha = `${m[3]}-${MESES[m[2]]}-${m[1].padStart(2, '0')}`
      map['/comparativa-hipotecas'] = fecha
      map['/en/mortgage-comparison'] = fecha
    }
  } catch { /* sin dato */ }

  // Páginas estáticas restantes: último commit de su fichero fuente
  const estaticas = {
    '/calculadora-hipotecaria': 'src/pages/calculadora-hipotecaria.astro',
    '/en/mortgage-calculator': 'src/pages/en/mortgage-calculator.astro',
    '/calculadora-alquiler': 'src/pages/calculadora-alquiler.astro',
    '/en/rental-calculator': 'src/pages/en/rental-calculator.astro',
    '/calculadora-itp': 'src/pages/calculadora-itp.astro',
    '/calculadora-plusvalia': 'src/pages/calculadora-plusvalia.astro',
    '/en/plusvalia-calculator': 'src/pages/en/plusvalia-calculator.astro',
    '/calculadora-gastos-compraventa': 'src/pages/calculadora-gastos-compraventa.astro',
    '/en/property-purchase-costs-calculator': 'src/pages/en/property-purchase-costs-calculator.astro',
    '/en/itp-calculator': 'src/pages/en/itp-calculator.astro',
    '/cuanto-me-prestan': 'src/pages/cuanto-me-prestan.astro',
    '/en/how-much-can-i-borrow': 'src/pages/en/how-much-can-i-borrow.astro',
    '/metodologia': 'src/pages/metodologia.astro',
    '/sobre-nosotros': 'src/pages/sobre-nosotros.astro',
    '/en/about': 'src/pages/en/about.astro',
    '/autores/jose-perales': 'src/pages/autores/jose-perales.astro',
    '/en/authors/jose-perales': 'src/pages/en/authors/jose-perales.astro',
    '/en/methodology': 'src/pages/en/methodology.astro',
    '/aviso-legal': 'src/pages/aviso-legal.astro',
    '/en/legal-notice': 'src/pages/en/legal-notice.astro',
    '/politica-de-privacidad': 'src/pages/politica-de-privacidad.astro',
    '/en/privacy-policy': 'src/pages/en/privacy-policy.astro',
    '/politica-de-cookies': 'src/pages/politica-de-cookies.astro',
    '/en/cookie-policy': 'src/pages/en/cookie-policy.astro',
    '/disclaimer-financiero': 'src/pages/disclaimer-financiero.astro',
    '/en/financial-disclaimer': 'src/pages/en/financial-disclaimer.astro',
  }
  for (const [ruta, fichero] of Object.entries(estaticas)) {
    const d = gitDate(fichero)
    if (d) map[ruta] = d
  }
  // Las calculadoras muestran los tipos de comunidades.ts (las de ITP,
  // además, a través del motor calculadora-itp.ts): su lastmod avanza
  // también cuando se revisan esos ficheros, en paralelo con el byline
  // (ultimaModificacionConjunta en cada página).
  const fechaComunidades = gitDate('src/constants/comunidades.ts')
  const fechaMotorITP = gitDate('src/utils/calculadora-itp.ts')
  const maxFecha = (...fechas) => fechas.filter(Boolean).sort().pop() ?? null
  const rutasConDatos = {
    '/calculadora-itp': maxFecha(fechaComunidades, fechaMotorITP),
    '/en/itp-calculator': maxFecha(fechaComunidades, fechaMotorITP),
    '/calculadora-hipotecaria': maxFecha(fechaComunidades, fechaMotorITP),
    '/en/mortgage-calculator': maxFecha(fechaComunidades, fechaMotorITP),
    '/calculadora-gastos-compraventa': fechaComunidades,
    '/en/property-purchase-costs-calculator': fechaComunidades,
    '/calculadora-alquiler': fechaComunidades,
    '/en/rental-calculator': fechaComunidades,
  }
  for (const [ruta, fecha] of Object.entries(rutasConDatos)) {
    if (fecha && (!map[ruta] || fecha > map[ruta])) map[ruta] = fecha
  }
  // Analytics: observed quarter != publication date. Each archived report keeps its release.
  const analyticsLatest = JSON.parse(readFileSync('src/data/analytics/2026-09-07-v1.json', 'utf8'))
  const analyticsReports = JSON.parse(readFileSync('src/data/analytics/reports.json', 'utf8'))
  for (const [root, slug, method, reports, letter] of [['/analytics','indice-esfuerzo-compra','metodologia','informes','t'],['/en/analytics','house-price-to-income','methodology','reports','q']]) {
    const base = `${root}/${slug}`
    for (const ruta of [root,base,`${base}/${method}`,`${base}/${reports}`,`${base}/madrid`,`${base}/barcelona`,`${base}/marbella`]) map[ruta] = analyticsLatest.modifiedAt
    for (const [quarter,version] of Object.entries(analyticsReports)) {
      const release = JSON.parse(readFileSync(`src/data/analytics/${version}.json`, 'utf8'))
      map[`${base}/${reports}/${quarter.toLowerCase().replace('q',`-${letter}`)}`] = release.modifiedAt
    }
    const home = root.startsWith('/en') ? '/en' : '/'
    if (!map[home] || map[home] < analyticsLatest.modifiedAt) map[home] = analyticsLatest.modifiedAt
  }
  // Google descarta el lastmod de todo el sitio si detecta fechas no fiables:
  // ninguna puede superar el momento del build (en UTC, que es como se publica)
  const hoyUTC = new Date().toISOString().slice(0, 10)
  for (const ruta of Object.keys(map)) if (map[ruta] > hoyUTC) map[ruta] = hoyUTC
  return map
}

const LASTMOD = buildLastmodMap()

// https://astro.build/config
export default defineConfig({
  // www + sin barra final: debe coincidir EXACTAMENTE con cómo sirve Vercel
  // (hipotecalc.com redirige a www; /pagina/ redirige a /pagina), para que
  // canonical, sitemap y hreflang no apunten a URLs que redirigen.
  site: "https://www.hipotecalc.com",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  output: "static",
  adapter: vercel({
    webAnalytics: {
      enabled: false,
    },
  }),
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: "terser",
      sourcemap: false,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          // Rolldown (Vite en Astro 7) solo acepta manualChunks como función.
          // ORDEN Y PRECISIÓN CRÍTICOS: React se evalúa primero y con patrones
          // delimitados por path. La versión anterior (`includes("echarts")`
          // antes que React) capturaba también echarts-for-react —módulo CJS
          // que requiere React— y metía la fachada de React dentro de
          // vendor-echarts: react-dom pasaba a importar ese chunk y cualquier
          // isla de cualquier página arrastraba 1,1 MB de ECharts.
          manualChunks(id) {
            if (!id.includes("node_modules")) return
            if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return "vendor-react"
            // Solo la librería de gráficos; el wrapper echarts-for-react queda
            // fuera a propósito y viaja con los chunks diferidos que lo importan
            if (/node_modules[\/](echarts|zrender)[\/]/.test(id)) return "vendor-echarts"
            if (id.includes("@iconify")) return "vendor-icons"
          },
        },
      },
    },
  },

  integrations: [
    icon(),
    react(),
    sitemap({
      serialize(item) {
        const ruta = new URL(item.url).pathname.replace(/\/$/, '') || '/'
        const lastmod = LASTMOD[ruta]
        if (lastmod) item.lastmod = lastmod
        return item
      },
    }),
    {
      // Con trailingSlash "never", @astrojs/sitemap reescribe el <loc> de la
      // raíz sin barra final (ignorando serialize); la reponemos para que
      // coincida con el canonical de la home (https://www.hipotecalc.com/).
      name: 'sitemap-root-slash',
      hooks: {
        'astro:build:done': ({ dir }) => {
          const dirPath = new URL(dir).pathname
          for (const f of readdirSync(dirPath).filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
            const p = `${dirPath}/${f}`
            const s = readFileSync(p, 'utf8').replace(
              '<loc>https://www.hipotecalc.com</loc>',
              '<loc>https://www.hipotecalc.com/</loc>'
            )
            writeFileSync(p, s)
          }
        },
      },
    },
    ...(isDev ? [keystatic()] : []),

    compress({
      // csso descarta los bloques `@media (width >= ...)` (sintaxis de rango
      // de Tailwind 4): la web perdía TODAS las variantes responsive en
      // producción. Vite ya minifica el CSS, este paso era redundante.
      CSS: false,
      // html-minifier-terser colapsa espacios dentro del HTML de las islas
      // React y provoca errores de hidratación (#418); Astro ya minifica el
      // HTML de forma segura con compressHTML.
      HTML: false,
      Image: false,
      JavaScript: true,
      SVG: true,
    }),
  ],
})
