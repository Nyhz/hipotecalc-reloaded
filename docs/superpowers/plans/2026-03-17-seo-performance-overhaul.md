# SEO & Performance Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical SEO issues preventing the site from ranking for "Calculadora hipotecaria" on Google, and improve performance.

**Architecture:** Fix canonical URLs (currently ALL pages point to homepage), add hreflang tags, add rich static SEO content to calculator pages, improve structured data per page, switch from `client:only` to `client:load` for SSR, and optimize fonts/bundling. The site is Astro 5 + React 19, deployed on Vercel.

**Tech Stack:** Astro 5.12, React 19, Tailwind CSS 4, Vercel

---

## File Structure

### Files to Modify
- `src/layouts/Layout.astro` — Fix canonical URL logic, add hreflang, improve structured data, optimize font loading, remove source maps
- `src/pages/index.astro` — Pass correct canonical URL
- `src/pages/calculadora-hipotecaria.astro` — Pass canonical URL, add rich SEO content (H1, FAQ, guide text), use `client:load`
- `src/pages/calculadora-alquiler.astro` — Pass canonical URL, add rich SEO content, use `client:load`
- `src/pages/en/index.astro` — Pass correct canonical URL
- `src/pages/en/mortgage-calculator.astro` — Pass canonical URL, add SEO content, use `client:load`
- `src/pages/en/rental-calculator.astro` — Pass canonical URL, add SEO content, use `client:load`
- `src/messages/es.json` — Add FAQ content, improved SEO titles/descriptions
- `src/messages/en.json` — Add FAQ content, improved SEO titles/descriptions
- `astro.config.mjs` — Remove source maps from production, optimize build
- `public/robots.txt` — Already fine, no changes needed

### Files to Create
- `src/components/seo/FAQSection.astro` — Reusable FAQ component with structured data
- `src/components/seo/Breadcrumbs.astro` — Breadcrumb nav with JSON-LD
- `src/components/seo/SEOContent.astro` — Reusable SEO content block for calculator pages

---

## Task 1: Fix Canonical URLs and Add Hreflang Tags

**Files:**
- Modify: `src/layouts/Layout.astro:8-29` (Props and canonical logic)
- Modify: `src/layouts/Layout.astro:48-74` (head meta tags)
- Modify: `src/pages/index.astro:10-14`
- Modify: `src/pages/calculadora-hipotecaria.astro:8-11`
- Modify: `src/pages/calculadora-alquiler.astro:8-11`
- Modify: `src/pages/en/index.astro:10-13`
- Modify: `src/pages/en/mortgage-calculator.astro` (similar pattern)
- Modify: `src/pages/en/rental-calculator.astro` (similar pattern)

- [ ] **Step 1: Update Layout.astro Props to auto-compute canonical from Astro.url**

Replace the Props defaults so `canonicalURL` is auto-computed from `Astro.url.pathname` when not explicitly passed. Add `alternateURL` prop for hreflang.

```astro
---
import { getAlternatePath } from '../utils/i18n';

export interface Props {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalURL?: string;
}

const {
  title = "Calculadora Hipotecaria - España | Herramientas Financieras",
  description = "Calculadora hipotecaria, de alquiler e ITP para España...",
  keywords = "calculadora hipoteca, calculadora alquiler...",
  ogImage = "/og-image.png",
} = Astro.props;

const currentLang = getCurrentLang(Astro.url.pathname);
const langAttribute = currentLang === 'en' ? 'en' : 'es';
const ogLocale = currentLang === 'en' ? 'en_US' : 'es_ES';
const alternateLang = currentLang === 'en' ? 'es' : 'en';

// Auto-compute canonical from current URL path
const siteBase = 'https://hipotecalc.com';
const canonicalURL = Astro.props.canonicalURL || `${siteBase}${Astro.url.pathname}`;
const alternatePath = getAlternatePath(Astro.url.pathname);
const alternateURL = `${siteBase}${alternatePath}`;
```

- [ ] **Step 2: Add hreflang tags to the head**

After the canonical link, add:

```html
<link rel="alternate" hreflang={langAttribute} href={canonicalURL} />
<link rel="alternate" hreflang={alternateLang} href={alternateURL} />
<link rel="alternate" hreflang="x-default" href={canonicalURL.includes('/en/') ? alternateURL : canonicalURL} />
```

- [ ] **Step 3: Remove hardcoded canonicalURL from page files**

All pages currently don't pass canonical (they rely on the default `'https://hipotecalc.com'`). With auto-computation, no changes needed to page files — just ensure they DON'T override canonical.

- [ ] **Step 4: Verify by building**

Run: `npm run build`
Expected: Build succeeds. Check `dist/index.html` and `dist/calculadora-hipotecaria/index.html` for correct canonical URLs.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "fix(seo): auto-compute canonical URLs and add hreflang tags"
```

---

## Task 2: Optimize SEO Titles and Meta Descriptions

**Files:**
- Modify: `src/messages/es.json:301-316` (seo section)
- Modify: `src/messages/en.json` (seo section)

- [ ] **Step 1: Update Spanish SEO strings**

```json
"seo": {
  "home": {
    "title": "Calculadora Hipotecaria Gratis | Simula tu Hipoteca en España 2025",
    "description": "Calculadora hipotecaria gratuita para España. Simula tu cuota mensual, calcula el ITP por comunidad autónoma, analiza el Euribor y compara hipoteca fija o variable.",
    "keywords": "calculadora hipotecaria, calculadora hipoteca españa, simulador hipoteca, calcular cuota hipoteca, ITP, euribor, hipoteca fija, hipoteca variable, comprar casa españa"
  },
  "mortgage": {
    "title": "Calculadora Hipotecaria Avanzada | Cuota, ITP e Impuestos España 2025",
    "description": "Calcula tu cuota hipotecaria mensual, ITP por comunidad autónoma, impuestos de compra de vivienda, porcentaje financiado y coste total de tu hipoteca en España.",
    "keywords": "calculadora hipotecaria avanzada, calcular cuota hipoteca, ITP calculadora, impuesto transmisiones patrimoniales, simulador hipoteca españa, hipoteca fija variable, gastos compra vivienda"
  },
  "rental": {
    "title": "Calculadora de Rentabilidad Alquiler | ROI Inversión Inmobiliaria España",
    "description": "Calcula la rentabilidad de tu inversión inmobiliaria en España. Analiza ROI, cash flow mensual, tiempo de recuperación y métricas clave para decidir si comprar para alquilar.",
    "keywords": "calculadora alquiler rentabilidad, ROI inmobiliario, inversión vivienda alquiler, cash flow inmobiliario, rentabilidad alquiler españa"
  }
}
```

- [ ] **Step 2: Update English SEO strings** (similar pattern with English keywords)

- [ ] **Step 3: Commit**

```bash
git add src/messages/es.json src/messages/en.json
git commit -m "fix(seo): optimize title tags and meta descriptions for target keywords"
```

---

## Task 3: Add Rich SEO Content to Calculadora Hipotecaria Page

**Files:**
- Create: `src/components/seo/FAQSection.astro`
- Create: `src/components/seo/Breadcrumbs.astro`
- Modify: `src/pages/calculadora-hipotecaria.astro`
- Modify: `src/messages/es.json` (add FAQ content)
- Modify: `src/messages/en.json` (add FAQ content)

- [ ] **Step 1: Create Breadcrumbs.astro component**

```astro
---
export interface BreadcrumbItem {
  name: string;
  href: string;
}
export interface Props {
  items: BreadcrumbItem[];
}
const { items } = Astro.props;
const siteBase = 'https://hipotecalc.com';
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": item.name,
    "item": `${siteBase}${item.href}`
  }))
};
---
<nav aria-label="Breadcrumb" class="w-full max-w-7xl mx-auto py-3">
  <ol class="flex items-center gap-2 text-sm text-slate-500">
    {items.map((item, i) => (
      <li class="flex items-center gap-2">
        {i > 0 && <span aria-hidden="true">/</span>}
        {i === items.length - 1 ? (
          <span class="text-slate-800 font-medium" aria-current="page">{item.name}</span>
        ) : (
          <a href={item.href} class="hover:text-blue-600 transition-colors">{item.name}</a>
        )}
      </li>
    ))}
  </ol>
</nav>
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

- [ ] **Step 2: Create FAQSection.astro component**

```astro
---
export interface FAQItem {
  question: string;
  answer: string;
}
export interface Props {
  title: string;
  items: FAQItem[];
}
const { title, items } = Astro.props;
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": items.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
};
---
<section class="w-full max-w-4xl mx-auto py-12">
  <h2 class="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">{title}</h2>
  <div class="space-y-4">
    {items.map(item => (
      <details class="group border border-slate-200 rounded-xl bg-white">
        <summary class="flex items-center justify-between p-5 cursor-pointer font-medium text-slate-800 hover:text-blue-700 transition-colors">
          <span>{item.question}</span>
          <span class="ml-4 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div class="px-5 pb-5 text-slate-600 leading-relaxed">
          <p>{item.answer}</p>
        </div>
      </details>
    ))}
  </div>
</section>
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

- [ ] **Step 3: Add FAQ translations to es.json and en.json**

Add to es.json under `"mortgage"`:

```json
"faq": {
  "title": "Preguntas Frecuentes sobre Hipotecas",
  "items": [
    {
      "question": "¿Cómo se calcula la cuota mensual de una hipoteca?",
      "answer": "La cuota mensual se calcula usando la fórmula de amortización francesa, que tiene en cuenta el capital prestado, el tipo de interés anual (TAE o TIN) y el plazo en años. Nuestra calculadora hipotecaria aplica esta fórmula automáticamente y te muestra el desglose de capital e intereses."
    },
    {
      "question": "¿Qué es el ITP y cuánto se paga al comprar una vivienda de segunda mano?",
      "answer": "El Impuesto de Transmisiones Patrimoniales (ITP) es el impuesto que se paga al comprar una vivienda de segunda mano en España. El porcentaje varía entre el 4% y el 10% según la comunidad autónoma, con bonificaciones para jóvenes, familias numerosas y otros supuestos."
    },
    {
      "question": "¿Es mejor una hipoteca fija o variable en 2025?",
      "answer": "Depende de tu perfil de riesgo y la evolución del Euribor. Una hipoteca fija te da estabilidad en la cuota, mientras que una variable puede ser más barata inicialmente pero fluctúa con el Euribor. Usa nuestra calculadora para comparar ambos escenarios con datos actualizados."
    },
    {
      "question": "¿Cuánto dinero necesito ahorrado para comprar una casa en España?",
      "answer": "Normalmente necesitas al menos un 20% del precio de la vivienda como entrada (los bancos suelen financiar hasta el 80% del valor de tasación), más un 10-12% adicional para cubrir impuestos (ITP o IVA), notaría, registro y gestoría. En total, aproximadamente un 30-32% del precio."
    },
    {
      "question": "¿Qué es el Euribor y cómo afecta a mi hipoteca?",
      "answer": "El Euribor (Euro Interbank Offered Rate) es el tipo de interés al que los bancos europeos se prestan dinero entre sí. Si tienes una hipoteca variable, tu cuota se recalcula periódicamente sumando un diferencial al Euribor vigente. Puedes consultar la evolución histórica del Euribor en nuestra página principal."
    }
  ]
}
```

- [ ] **Step 4: Rewrite calculadora-hipotecaria.astro with rich content**

Replace the page to include: proper H1, introductory paragraph, breadcrumbs, the calculator, explanatory SEO content, and FAQ.

```astro
---
import Layout from '../layouts/Layout.astro';
import MortgageCalculator from '../components/calculadora-hipotecaria/MortgageCalculator'
import PageTracking from '../components/PageTracking.tsx';
import Breadcrumbs from '../components/seo/Breadcrumbs.astro';
import FAQSection from '../components/seo/FAQSection.astro';
import { t } from '../utils/i18n';
---

<Layout
  title={t('seo.mortgage.title')}
  description={t('seo.mortgage.description')}
  keywords={t('seo.mortgage.keywords')}
>
  <PageTracking client:load pagePath="/calculadora-hipotecaria" pageTitle={t('seo.mortgage.title')} />

  <Breadcrumbs items={[
    { name: 'Inicio', href: '/' },
    { name: 'Calculadora Hipotecaria', href: '/calculadora-hipotecaria' }
  ]} />

  <main class="w-full max-w-7xl mx-auto py-8 ambient-section rounded-3xl">
    <div class="ambient-content text-center mb-6 reveal-up">
      <span class="inline-flex rounded-full border border-blue-200 bg-blue-50 text-blue-700 px-4 py-1 text-xs font-semibold uppercase tracking-wider">
        {t('mortgage.title')}
      </span>
      <h1 class="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mt-4 mb-3">
        Calculadora Hipotecaria España 2025
      </h1>
      <p class="mt-3 text-slate-600 max-w-3xl mx-auto text-lg">
        {t('mortgage.description')}
      </p>
    </div>
    <div class="ambient-content reveal-up reveal-delay-1">
      <MortgageCalculator client:load />
    </div>
  </main>

  <!-- SEO Content Section -->
  <section class="w-full max-w-4xl mx-auto py-12 px-4">
    <h2 class="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-6">
      ¿Cómo usar nuestra calculadora hipotecaria?
    </h2>
    <div class="prose prose-slate max-w-none text-slate-600 space-y-4">
      <p>
        Nuestra <strong>calculadora hipotecaria</strong> te permite simular las condiciones de tu hipoteca en España de forma gratuita y precisa.
        Introduce el precio de la vivienda, el ahorro que aportas como entrada, el tipo de interés y el plazo,
        y obtendrás al instante tu <strong>cuota mensual</strong>, el <strong>coste total de la hipoteca</strong> y un desglose completo de intereses.
      </p>
      <p>
        Además, puedes calcular el <strong>ITP (Impuesto de Transmisiones Patrimoniales)</strong> según tu comunidad autónoma,
        con las bonificaciones aplicables para jóvenes menores de 35 años, familias numerosas o personas con discapacidad.
        Para viviendas de obra nueva, la calculadora aplica automáticamente el <strong>IVA</strong> correspondiente.
      </p>
      <p>
        Compara entre <strong>hipoteca fija y variable</strong> para ver cómo afecta el Euribor a tu cuota mensual.
        El análisis de sensibilidad te muestra cómo variaría tu cuota con diferentes precios de vivienda y niveles de ahorro,
        ayudándote a tomar la mejor decisión financiera.
      </p>
    </div>
  </section>

  <!-- FAQ Section -->
  <FAQSection
    title="Preguntas Frecuentes sobre Hipotecas"
    items={[
      {
        question: "¿Cómo se calcula la cuota mensual de una hipoteca?",
        answer: "La cuota mensual se calcula usando la fórmula de amortización francesa, que tiene en cuenta el capital prestado, el tipo de interés anual (TAE o TIN) y el plazo en años. Nuestra calculadora hipotecaria aplica esta fórmula automáticamente y te muestra el desglose de capital e intereses."
      },
      {
        question: "¿Qué es el ITP y cuánto se paga al comprar una vivienda de segunda mano?",
        answer: "El Impuesto de Transmisiones Patrimoniales (ITP) es el impuesto que se paga al comprar una vivienda de segunda mano en España. El porcentaje varía entre el 4% y el 10% según la comunidad autónoma, con bonificaciones para jóvenes, familias numerosas y otros supuestos."
      },
      {
        question: "¿Es mejor una hipoteca fija o variable en 2025?",
        answer: "Depende de tu perfil de riesgo y la evolución del Euribor. Una hipoteca fija te da estabilidad en la cuota, mientras que una variable puede ser más barata inicialmente pero fluctúa con el Euribor. Usa nuestra calculadora para comparar ambos escenarios con datos actualizados."
      },
      {
        question: "¿Cuánto dinero necesito ahorrado para comprar una casa en España?",
        answer: "Normalmente necesitas al menos un 20% del precio de la vivienda como entrada (los bancos suelen financiar hasta el 80% del valor de tasación), más un 10-12% adicional para cubrir impuestos (ITP o IVA), notaría, registro y gestoría. En total, aproximadamente un 30-32% del precio."
      },
      {
        question: "¿Qué es el Euribor y cómo afecta a mi hipoteca?",
        answer: "El Euribor (Euro Interbank Offered Rate) es el tipo de interés al que los bancos europeos se prestan dinero entre sí. Si tienes una hipoteca variable, tu cuota se recalcula periódicamente sumando un diferencial al Euribor vigente. Puedes consultar la evolución histórica del Euribor en nuestra página principal."
      }
    ]}
  />
</Layout>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/seo/ src/pages/calculadora-hipotecaria.astro src/messages/es.json src/messages/en.json
git commit -m "feat(seo): add rich content, FAQ with schema, and breadcrumbs to mortgage calculator page"
```

---

## Task 4: Add Rich SEO Content to Remaining Pages

**Files:**
- Modify: `src/pages/calculadora-alquiler.astro`
- Modify: `src/pages/en/mortgage-calculator.astro`
- Modify: `src/pages/en/rental-calculator.astro`

- [ ] **Step 1: Update calculadora-alquiler.astro with H1, SEO content, breadcrumbs, FAQ**

Follow the same pattern as Task 3 for the rental calculator page, with rental-specific FAQ and content.

- [ ] **Step 2: Update English calculator pages** with translated SEO content, breadcrumbs, and FAQ.

- [ ] **Step 3: Change `client:only="react"` to `client:load`** on RentalCalculator components.

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/calculadora-alquiler.astro src/pages/en/
git commit -m "feat(seo): add rich SEO content and FAQ to rental and English calculator pages"
```

---

## Task 5: Improve Structured Data Per Page

**Files:**
- Modify: `src/layouts/Layout.astro:83-104` (JSON-LD section)

- [ ] **Step 1: Make structured data dynamic per page**

Add a `structuredData` prop to Layout, defaulting to the WebApplication schema but allowing pages to override. Also add `SoftwareApplication` type with `aggregateRating` placeholder.

```astro
// In Layout frontmatter
const defaultStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": title,
  "description": description,
  "url": canonicalURL,
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "creator": {
    "@type": "Organization",
    "name": "Hipotecalc",
    "url": "https://hipotecalc.com"
  },
  "inLanguage": langAttribute,
  "keywords": keywords
};
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "fix(seo): make structured data dynamic per page with correct title/URL/language"
```

---

## Task 6: Switch client:only to client:load for SSR

**Files:**
- Modify: `src/pages/calculadora-hipotecaria.astro:24` (already done in Task 3)
- Modify: `src/pages/index.astro:22` (EuriborChart)
- Modify: `src/pages/en/index.astro:22` (EuriborChart)

- [ ] **Step 1: Change EuriborChart from `client:only="react"` to `client:load`**

In `src/pages/index.astro` and `src/pages/en/index.astro`:

```diff
-<EuriborChart client:only="react"/>
+<EuriborChart client:load />
```

Note: MortgageCalculator and RentalCalculator already changed to `client:load` in Tasks 3 and 4.

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds. If SSR errors occur for EuriborChart (due to window/document access), wrap those in `typeof window !== 'undefined'` checks or keep as `client:only` for that specific component.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "fix(seo): switch client:only to client:load for server-side rendering"
```

---

## Task 7: Performance Optimizations

**Files:**
- Modify: `astro.config.mjs:25-44` (Vite build config)
- Modify: `src/layouts/Layout.astro:77-81` (font loading)

- [ ] **Step 1: Remove source maps from production build**

In `astro.config.mjs`:

```javascript
vite: {
  plugins: [tailwindcss()],
  build: {
    minify: "terser",
    sourcemap: false, // Don't expose source maps in production
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-echarts": ["echarts", "echarts-for-react"],
          "vendor-icons": ["@iconify/react"],
        },
      },
    },
  },
},
```

- [ ] **Step 2: Make Google Fonts non-render-blocking**

Replace the synchronous font stylesheet with a preload + async pattern:

```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" media="print" onload="this.media='all'" />
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" />
</noscript>
```

- [ ] **Step 3: Reduce cookie consent polling frequency**

In Layout.astro, change `setInterval(handleConsentChange, 500)` to `setInterval(handleConsentChange, 2000)` — checking every 2 seconds instead of every 500ms is more than sufficient.

- [ ] **Step 4: Build and verify performance**

Run: `npm run build`
Expected: Smaller bundle size, no source maps in dist.

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs src/layouts/Layout.astro
git commit -m "perf: remove production source maps, async font loading, reduce polling"
```

---

## Task 8: Fix OG Image Format

**Files:**
- Create: `public/og-image.png` (convert from SVG or create new 1200x630 PNG)
- Modify: `src/layouts/Layout.astro:60,69` (og:image references)

- [ ] **Step 1: Update og:image default to PNG**

In Layout.astro props:
```diff
-ogImage = "/og-image.svg",
+ogImage = "/og-image.png",
```

- [ ] **Step 2: Create a proper OG image**

Generate a 1200x630 PNG image with the site branding. If no design tool is available, convert the existing SVG to PNG.

- [ ] **Step 3: Commit**

```bash
git add public/og-image.png src/layouts/Layout.astro
git commit -m "fix(seo): use PNG format for Open Graph image (SVG not supported by social platforms)"
```

---

## Task 9: Add Homepage SEO Content

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Add SEO content section below tools on homepage**

After the EuriborChart, add a section with keyword-rich content about the site's purpose:

```astro
<!-- SEO Content Section -->
<section class="w-full max-w-4xl mx-auto py-12 px-4">
  <h2 class="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-6">
    Tu calculadora hipotecaria de confianza en España
  </h2>
  <div class="text-slate-600 space-y-4">
    <p>
      <strong>Hipotecalc</strong> es tu herramienta gratuita para calcular hipotecas en España.
      Nuestra <strong>calculadora hipotecaria</strong> te permite simular la cuota mensual de tu hipoteca,
      comparar entre hipoteca fija y variable, y calcular los impuestos de compra de vivienda por comunidad autónoma.
    </p>
    <p>
      Además, con nuestra <strong>calculadora de alquiler</strong> puedes analizar la rentabilidad de una inversión inmobiliaria,
      calculando el ROI, cash flow mensual y tiempo de recuperación de tu inversión.
    </p>
  </div>
</section>
```

- [ ] **Step 2: Add equivalent English content**

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(seo): add keyword-rich content sections to homepages"
```

---

## Execution Order

Tasks 1-3 are highest priority (canonical URLs, titles, and rich content are the biggest SEO wins). Tasks can be parallelized as follows:
- **Sequential:** Task 1 → Task 5 (both modify Layout.astro)
- **Parallel group A:** Task 2, Task 3, Task 4
- **Parallel group B:** Task 6, Task 7, Task 8, Task 9
