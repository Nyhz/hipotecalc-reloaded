# Rediseño «Papel y lima» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar la identidad «Papel y lima» (spec `docs/superpowers/specs/2026-07-02-redesign-papel-lima-design.md`) a toda la web: landing + 2 calculadoras, ES y EN.

**Architecture:** La identidad se centraliza en `src/style/globals.css` como tokens Tailwind 4 (`@theme`) + clases de componente (`.receipt`, `.cta-broker`, `.btn-ink`…); los componentes Astro/React solo cambian sus recetas de clases y estructura. Un único componente React `AnimatedNumber` da los count-ups en islas React; las secciones estáticas Astro usan un script inline con `IntersectionObserver`. Contenido en columna centrada `max-w-7xl` (1280px).

**Tech Stack:** Astro 5 + React 19 + Tailwind CSS 4 (`@tailwindcss/vite`, tokens vía `@theme`), echarts, Google Fonts (Fraunces, Inter, IBM Plex Mono), Lucide vía astro-icon.

## Global Constraints

- Ancho de contenido: `max-w-7xl` (1280px) centrado; **nunca** `max-w-[1920px]` (eliminarlo allá donde aparezca).
- El color lima `#D9F24F` es EXCLUSIVO del CTA de broker + subrayador del titular hero + acentos sobre fondos tinta. Nunca en otros botones/fondos.
- Máx. **2 CTAs de broker por página**: navbar + (home: banda de cierre | calculadoras: botón del recibo sticky).
- Tipos: Fraunces (titulares/cifras grandes), Inter (cuerpo), IBM Plex Mono (eyebrows/etiquetas/datos). Manrope desaparece.
- Toda cifra usa `font-variant-numeric: tabular-nums`.
- Toda animación se desactiva bajo `prefers-reduced-motion: reduce`.
- No tocar: lógica de `src/utils/*.ts`, datos de `src/constants/*`, rutas, meta/SEO/schema (el contenido textual SEO se conserva; solo cambia la maqueta), analítica/CookieYes.
- No hay framework de tests: cada task verifica con `npm run build` + captura Playwright (`npx playwright screenshot`) + criterios de aceptación visuales.
- Dev server para capturas: `npm run dev` (puerto 4321). Capturas a `/private/tmp/claude-501/-Users-nyhzdev-dev-hipotecalc-reloaded/c0667087-564d-46fb-8694-118458b26839/scratchpad/shots/`.
- Commits frecuentes, mensajes `feat(redesign): …`.

---

### Task 1: Design system — tokens, clases y fuentes

**Files:**
- Modify: `src/style/globals.css` (reescritura completa)
- Modify: `src/layouts/Layout.astro:112-120` (fuentes) y `:302-308` (body/main)
- Create: `src/components/ui/AnimatedNumber.tsx`

**Interfaces:**
- Produces (clases CSS usadas por TODAS las tasks siguientes): `bg-paper`, `text-ink`, `text-ink-soft`, `border-line`, `bg-lime`, `text-brand-blue` (tokens `@theme`); clases de componente `.eyebrow`, `.hl-lime`, `.btn-ink`, `.btn-outline`, `.cta-broker`, `.cta-broker .cta-dot`, `.receipt`, `.receipt-head`, `.receipt-row`, `.receipt-total`, `.pl-card`, `.icon-chip`, `.input-pl`, `.reveal-up` (se conserva), `.font-heading` (pasa a Fraunces), `.font-data` (Plex Mono).
- Produces (React): `AnimatedNumber({ value, suffix?, decimals?, duration?, className? })` — renderiza `<span>` que anima de valor anterior → nuevo con easing cubic-out; sin animación si `prefers-reduced-motion`.

- [ ] **Step 1: Reescribir `src/style/globals.css`**

Sustituir TODO el contenido por:

```css
@import "tailwindcss";

@theme {
  --color-paper: #faf9f4;
  --color-paper-2: #f2f0e8;
  --color-ink: #171b26;
  --color-ink-soft: #4a5061;
  --color-line: rgba(23, 27, 38, 0.12);
  --color-lime: #d9f24f;
  --color-lime-hover: #cbea33;
  --color-brand-blue: #2a4cf0;
  --color-positive: #1fa55a;
  --color-negative: #dc2626;
  --font-heading: "Fraunces", Georgia, serif;
  --font-sans: "Inter", "Segoe UI", sans-serif;
  --font-data: "IBM Plex Mono", ui-monospace, monospace;
}

body {
  font-family: var(--font-sans);
  color: var(--color-ink);
  background-color: var(--color-paper);
  background-image:
    linear-gradient(rgba(23, 27, 38, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(23, 27, 38, 0.035) 1px, transparent 1px);
  background-size: 44px 44px;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-ink);
  letter-spacing: -0.02em;
}

.font-heading { font-family: var(--font-heading); }
.font-data { font-family: var(--font-data); font-variant-numeric: tabular-nums; }

/* ── Eyebrow: etiqueta mono con raya azul ── */
.eyebrow {
  font-family: var(--font-data);
  font-size: 11.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.eyebrow::before { content: ""; width: 26px; height: 1.5px; background: var(--color-brand-blue); }

/* ── Subrayador lima del hero (exclusivo del H1) ── */
.hl-lime { position: relative; white-space: nowrap; }
.hl-lime::after {
  content: "";
  position: absolute; left: -1%; bottom: 7%;
  width: 102%; height: 34%;
  background: var(--color-lime);
  border-radius: 4px;
  z-index: -1;
  transform: scaleX(0); transform-origin: left;
  animation: hl-swipe 0.7s 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes hl-swipe { to { transform: scaleX(1); } }

/* ── Botones ── */
.btn-ink, .btn-outline, .cta-broker {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  border-radius: 9999px; font-weight: 600; cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
.btn-ink { background: var(--color-ink); color: var(--color-paper); }
.btn-ink:hover { background: var(--color-brand-blue); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(42, 76, 240, 0.25); }
.btn-outline { background: #fff; color: var(--color-ink); border: 1px solid rgba(23, 27, 38, 0.25); }
.btn-outline:hover { border-color: var(--color-ink); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(23, 27, 38, 0.08); }
.cta-broker {
  background: var(--color-lime); color: var(--color-ink); font-weight: 700;
  border: 1px solid rgba(23, 27, 38, 0.2);
  box-shadow: 0 4px 14px rgba(217, 242, 79, 0.5), 0 1px 0 rgba(23, 27, 38, 0.15);
}
.cta-broker:hover { background: var(--color-lime-hover); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(217, 242, 79, 0.65); }
.cta-dot { width: 8px; height: 8px; border-radius: 9999px; background: var(--color-positive); animation: dot-pulse 2s infinite; flex-shrink: 0; }
@keyframes dot-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(31, 165, 90, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 5px rgba(31, 165, 90, 0); }
}

/* ── Tarjetas ── */
.pl-card {
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 16px;
}
.pl-card-hover { transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s, border-color 0.25s; }
.pl-card-hover:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(23, 27, 38, 0.12); border-color: rgba(23, 27, 38, 0.3); }
.icon-chip {
  width: 44px; height: 44px;
  border: 1px solid var(--color-line); border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-paper); color: var(--color-ink);
}
.arrow-chip {
  width: 36px; height: 36px;
  border: 1px solid rgba(23, 27, 38, 0.25); border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  background: #fff; transition: all 0.25s;
}
.group:hover .arrow-chip { background: var(--color-lime); transform: rotate(45deg); }

/* ── Recibo (panel de resultados) ── */
.receipt {
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  box-shadow: 0 20px 44px rgba(23, 27, 38, 0.12);
}
.receipt-head {
  font-family: var(--font-data); font-size: 11.5px; letter-spacing: 0.1em;
  color: var(--color-ink-soft);
  border-bottom: 1px dashed rgba(23, 27, 38, 0.3);
  padding-bottom: 12px; margin-bottom: 14px;
  display: flex; justify-content: space-between; align-items: center;
  text-transform: uppercase;
}
.receipt-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13.5px; padding: 7px 0; color: var(--color-ink-soft);
}
.receipt-row b, .receipt-row strong { color: var(--color-ink); font-weight: 600; font-variant-numeric: tabular-nums; }
.receipt-total {
  border-top: 1px dashed rgba(23, 27, 38, 0.3);
  margin-top: 10px; padding-top: 14px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.receipt-total .receipt-label { font-family: var(--font-data); font-size: 11.5px; letter-spacing: 0.08em; color: var(--color-ink-soft); text-transform: uppercase; }
.receipt-total .receipt-num { font-family: var(--font-heading); font-size: 36px; font-weight: 700; color: var(--color-brand-blue); font-variant-numeric: tabular-nums; line-height: 1.1; }
.receipt-chip {
  position: absolute; top: -14px; right: 18px;
  background: var(--color-ink); color: var(--color-lime);
  font-family: var(--font-data); font-size: 10.5px; font-weight: 600;
  padding: 8px 13px; border-radius: 9999px;
  box-shadow: 0 6px 14px rgba(23, 27, 38, 0.25);
}

/* ── Inputs ── */
.input-pl {
  width: 100%;
  background: #fff;
  border: 1px solid rgba(23, 27, 38, 0.2);
  border-radius: 10px;
  padding: 11px 13px;
  font-size: 14px;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input-pl:focus { outline: none; border-color: var(--color-brand-blue); box-shadow: 0 0 0 3px rgba(42, 76, 240, 0.15); }
.label-pl { display: block; font-size: 12.5px; font-weight: 600; color: var(--color-ink); margin-bottom: 5px; }

/* ── Animación de entrada (se conserva del sitio anterior) ── */
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-up { animation: reveal-up 560ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.reveal-delay-1 { animation-delay: 80ms; }
.reveal-delay-2 { animation-delay: 160ms; }
.reveal-delay-3 { animation-delay: 240ms; }

/* ── Sala de datos (sección oscura) ── */
.data-room { background: var(--color-ink); color: var(--color-paper); border-radius: 18px; }
.data-room .eyebrow { color: rgba(250, 249, 244, 0.55); }
.data-room .eyebrow::before { background: var(--color-lime); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .hl-lime::after { transform: scaleX(1); }
}

/* Ocultar flechitas de inputs numéricos */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
```

Nota: desaparecen `.surface-nav`, `.surface-card`, `.surface-card-strong`, `.btn`, `.btn-primary`, `.btn-secondary`, `.calculator-shell`, `.section-card`, `.panel-card`, `.kpi-card`, `.metric-row`, `.ambient-section`, `.float-soft` y el CSS de estabilidad de fuentes. Las tasks 2–6 retiran sus usos; hasta entonces esos elementos quedan sin estilo de tarjeta (aceptable en rama).

- [ ] **Step 2: Cambiar fuentes en `src/layouts/Layout.astro`**

Sustituir las 3 líneas de Google Fonts (preload + stylesheet + noscript, líneas 116-120) usando la nueva URL en las tres:

```
https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap
```

Y en el mismo fichero, sustituir el `<body>`/`<main>` (líneas 302-306) por:

```html
<body class="min-h-screen flex flex-col">
  <Navbar client:load />
  <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col">
    <slot />
  </main>
```

(El `max-w-7xl` vive ahora en `<main>`; los componentes internos ya no declaran su propio ancho máximo.)

- [ ] **Step 3: Crear `src/components/ui/AnimatedNumber.tsx`**

```tsx
import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
  value: number
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

export default function AnimatedNumber({
  value,
  suffix = "",
  decimals = 0,
  duration = 900,
  className = "",
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  const raf = useRef(0)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || prev.current === value) {
      prev.current = value
      setDisplay(value)
      return
    }
    const from = prev.current
    prev.current = value
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (value - from) * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])

  return (
    <span className={className}>
      {display.toLocaleString("es-ES", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: exit 0, sin errores CSS/TS.

- [ ] **Step 5: Captura de humo**

Con `npm run dev` corriendo: `npx playwright screenshot --viewport-size=1920,1080 http://localhost:4321/ <scratchpad>/shots/t1-home.png`
Aceptación: fondo papel con retícula visible, titulares en serif (Fraunces), sin errores en consola del build. (La página estará a medio vestir: OK.)

- [ ] **Step 6: Commit**

```bash
git add src/style/globals.css src/layouts/Layout.astro src/components/ui/AnimatedNumber.tsx
git commit -m "feat(redesign): papel-y-lima design tokens, fonts and AnimatedNumber"
```

---

### Task 2: Navbar (fix padding incluido) + ContactButton + Footer

**Files:**
- Modify: `src/components/Navbar.tsx` (reescritura; el fichero duplicado `src/components/layout/Navbar.tsx` y `src/components/layout/Footer.astro` NO se usan — eliminarlos)
- Modify: `src/components/ContactButton.tsx`
- Modify: `src/components/LanguageSwitcher.tsx:19` (clases)
- Modify: `src/components/Footer.astro` (reescritura)
- Delete: `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.astro`

**Interfaces:**
- Consumes: clases Task 1 (`.cta-broker`, `.cta-dot`, `.btn-outline`).
- Produces: `ContactButton({ variant?: "desktop" | "mobile" | "receipt", labelKey?: string })` — `receipt` es ancho completo para el recibo sticky; `labelKey` (default `"common.contact"`) permite «Mejorar esta cuota» en Task 5/6. Mantiene `trackContactAttempt` y `referalLink` intactos.

- [ ] **Step 1: Reescribir `src/components/ContactButton.tsx`**

```tsx
import { referalLink } from "../constants/referal"
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics"
import { useTranslations } from "../hooks/useTranslations"

interface ContactButtonProps {
  variant?: "desktop" | "mobile" | "receipt"
  labelKey?: string
  className?: string
}

export default function ContactButton({
  variant = "desktop",
  labelKey,
  className = "",
}: ContactButtonProps) {
  const { trackContactAttempt } = useGoogleAnalytics()
  const { t } = useTranslations()

  const variantClasses = {
    desktop: "px-5 py-2.5 text-sm",
    mobile: "px-3 py-2 text-xs",
    receipt: "w-full px-5 py-3.5 text-sm",
  }

  const key = labelKey ?? (variant === "mobile" ? "common.contactMobile" : "common.contact")

  return (
    <a
      href={referalLink}
      target="_blank"
      className={`cta-broker ${variantClasses[variant]} ${className}`}
      onClick={() => trackContactAttempt(`navbar_${variant}`)}
    >
      <span className="cta-dot"></span>
      {t(key)}
    </a>
  )
}
```

- [ ] **Step 2: Reescribir `src/components/Navbar.tsx`**

Conservar: los dos `useEffect` de sincronización de ruta (`astro:page-load`/`popstate`) y el estado `isMenuOpen`. Eliminar: `showFloatingNav`, `navRef` y todo el bloque `{showFloatingNav && …}` (la mini-nav flotante desaparece). El JSX del `return` pasa a ser:

```tsx
return (
  <nav className="w-full sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-3 md:items-center h-16">
        <div className="flex justify-start">
          <a href={homeHref} className="font-heading text-[22px] font-bold text-ink tracking-tight">
            hipotecalc<span className="text-brand-blue">.</span>
          </a>
        </div>
        <ul className="flex justify-center items-center gap-1">
          {tools.filter((tool) => tool.active).map((tool) => (
            <li key={tool.href}>
              <a
                href={tool.href}
                className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition ${
                  isActivePath(tool.href)
                    ? "bg-ink text-white"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {tool.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex justify-end items-center gap-3">
          <LanguageSwitcher />
          <ContactButton variant="desktop" />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between h-14 gap-2">
        <a href={homeHref} className="font-heading text-lg font-bold text-ink tracking-tight">
          hipotecalc<span className="text-brand-blue">.</span>
        </a>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ContactButton variant="mobile" />
          <button onClick={toggleMenu} className="p-2 text-ink" aria-label="Toggle menu">
            {/* mismo SVG hamburguesa/X actual, sin cambios */}
          </button>
        </div>
      </div>
    </div>

    {isMenuOpen && (
      <div className="md:hidden border-t border-line bg-paper">
        <ul className="max-w-7xl mx-auto px-4 py-2 space-y-1">
          {tools.filter((tool) => tool.active).map((tool) => (
            <li key={tool.href}>
              <a
                href={tool.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActivePath(tool.href) ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5"
                }`}
              >
                {tool.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}
  </nav>
)
```

(El fix del bug original: el contenedor interior lleva `px-4 sm:px-6`; la nav es ahora barra completa con borde inferior, no tarjeta flotante, así que no puede «chocar» con los bordes.)

- [ ] **Step 3: Retocar `src/components/LanguageSwitcher.tsx`**

Línea 19, sustituir `className` por: `"btn-outline px-2.5 py-1.5 text-xs cursor-pointer"`.

- [ ] **Step 4: Reescribir `src/components/Footer.astro`**

Misma estructura de datos (props `lang`, `getTools`, columnas Herramientas/Idioma) pero piel tinta, a sangre completa:

```astro
<footer class="w-full mt-16 bg-ink text-paper">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
    <div class="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
      <div class="max-w-md">
        <a href={homeHref} class="font-heading text-2xl font-bold tracking-tight text-paper">
          hipotecalc<span class="text-lime">.</span>
        </a>
        <p class="mt-3 text-sm leading-relaxed text-paper/60">
          {lang === 'en'
            ? 'Professional mortgage and rental analysis tools tailored for Spain.'
            : 'Herramientas profesionales para analizar hipotecas, alquileres e impuestos en España.'}
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div>
          <h3 class="font-data text-xs font-semibold uppercase tracking-widest text-paper/50">
            {lang === 'en' ? 'Tools' : 'Herramientas'}
          </h3>
          <ul class="mt-3 space-y-2">
            {tools.filter((tool) => tool.active).map((tool) => (
              <li>
                <a href={tool.href} class="text-sm font-medium text-paper/80 hover:text-lime transition-colors">
                  {tool.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 class="font-data text-xs font-semibold uppercase tracking-widest text-paper/50">
            {lang === 'en' ? 'Language' : 'Idioma'}
          </h3>
          <p class="mt-3 text-sm text-paper/80">
            {lang === 'en' ? 'Viewing in English' : 'Viendo en Español'}
          </p>
          <p class="mt-4 font-data text-xs text-paper/40">
            © {new Date().getFullYear()} Hipotecalc. {t('footer.copyright', lang)}
          </p>
        </div>
      </div>
    </div>
  </div>
</footer>
```

(Frontmatter idéntico al actual. Nota: como `<main>` tiene `max-w-7xl`, el footer debe renderizarse FUERA de `<main>` — ya lo está en `Layout.astro`.)

- [ ] **Step 5: Borrar duplicados muertos**

```bash
git rm src/components/layout/Navbar.tsx src/components/layout/Footer.astro
```

- [ ] **Step 6: Verificar**

Run: `npm run build` → exit 0.
Capturas 1920 y 390 de `/`. Aceptación: nav a ancho completo con contenido alineado a la columna de 1280px (logo NO pegado al borde), enlace activo píldora tinta en las calculadoras, CTA lima con punto pulsante único elemento de color, footer tinta a sangre.

- [ ] **Step 7: Commit**

```bash
git add -A src/components
git commit -m "feat(redesign): navbar with lateral padding fix, lime broker CTA, ink footer"
```

---

### Task 3: Home — hero con recibo + franja de stats (ES y EN)

**Files:**
- Modify: `src/components/home/Hero.astro` (reescritura)
- Create: `src/components/home/StatsStrip.astro`
- Modify: `src/messages/es.json`, `src/messages/en.json` (nuevas claves `home.hero.*`, `home.stats.*`)
- Modify: `src/pages/index.astro` y `src/pages/en/index.astro` (añadir `<StatsStrip>` tras `<Hero>`)

**Interfaces:**
- Consumes: `.eyebrow`, `.hl-lime`, `.btn-ink`, `.btn-outline`, `.receipt*` (Task 1).
- Produces: claves i18n `home.hero.headlinePre`, `home.hero.headlineHl`, `home.stats.euribor`, `home.stats.ccaa`, `home.stats.free`, `home.stats.time` (+ labels).

- [ ] **Step 1: Añadir claves i18n**

En `src/messages/es.json`, dentro de `home.hero` añadir/sustituir:

```json
"headlinePre": "Los números de tu casa, ",
"headlineHl": "por fin claros",
"description": "Cuota, impuestos por comunidad y rentabilidad del alquiler. Sin registros ni letra pequeña: escribes cuatro datos y ves toda la operación al instante.",
"trustFree": "100% gratuito",
"trustNoSignup": "Sin registro",
"trustData": "Datos {year}",
"receiptTitle": "Tu simulación",
"receiptLive": "■ En vivo",
"receiptPrice": "Precio vivienda",
"receiptDown": "Entrada (20%)",
"receiptItp": "ITP (Madrid, 6%)",
"receiptTerm": "Plazo",
"receiptTermValue": "25 años",
"receiptTotal": "Cuota / mes",
"receiptChip": "EURÍBOR + 1% → 2,94%"
```

Y nueva sección `home.stats`:

```json
"stats": {
  "euriborLabel": "Euríbor · 2025",
  "ccaaLabel": "CCAA con ITP propio",
  "freeLabel": "Gratis · sin registro",
  "timeLabel": "Por simulación",
  "timeValue": "2 min"
}
```

En `en.json`, equivalentes naturales: `"headlinePre": "Your home's numbers, "`, `"headlineHl": "finally clear"`, `"receiptTotal": "Payment / month"`, `"receiptChip": "EURIBOR + 1% → 2.94%"`, `"stats": { "euriborLabel": "Euribor · 2025", "ccaaLabel": "Regions with own ITP", "freeLabel": "Free · no sign-up", "timeLabel": "Per simulation", "timeValue": "2 min" }`, etc.

- [ ] **Step 2: Reescribir `src/components/home/Hero.astro`**

```astro
---
export interface Props { lang?: 'es' | 'en'; }
const { lang = 'es' } = Astro.props;
import { t } from '../../utils/i18n';
const calcHref = lang === 'en' ? '/en/mortgage-calculator' : '/calculadora-hipotecaria';
const rentHref = lang === 'en' ? '/en/rental-calculator' : '/calculadora-alquiler';
---
<section class="w-full grid lg:grid-cols-[1.12fr_.88fr] gap-12 items-center pt-14 pb-12 lg:pt-20 lg:pb-16">
  <div class="text-center lg:text-left">
    <span class="eyebrow reveal-up">{lang === 'en' ? 'Financial calculators · Spain' : 'Calculadoras financieras · España'} {new Date().getFullYear()}</span>
    <h1 class="font-heading text-4xl md:text-5xl lg:text-[54px] font-semibold leading-[1.05] tracking-[-1.3px] text-ink mt-5 mb-5 reveal-up reveal-delay-1">
      {t('home.hero.headlinePre', lang)}<span class="hl-lime">{t('home.hero.headlineHl', lang)}</span>.
    </h1>
    <p class="text-base md:text-lg text-ink-soft leading-relaxed max-w-[46ch] mx-auto lg:mx-0 mb-7 reveal-up reveal-delay-2">
      {t('home.hero.description', lang)}
    </p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start reveal-up reveal-delay-2">
      <a href={calcHref} class="btn-ink px-7 py-4 text-[15px]">{t('home.hero.calculateMortgage', lang)} →</a>
      <a href={rentHref} class="btn-outline px-6 py-4 text-[15px]">{t('home.hero.calculateRental', lang)}</a>
    </div>
    <div class="font-data text-[11px] text-ink-soft mt-5 flex gap-5 justify-center lg:justify-start reveal-up reveal-delay-3">
      <span>✓ {t('home.hero.trustFree', lang)}</span>
      <span>✓ {t('home.hero.trustNoSignup', lang)}</span>
      <span>✓ {t('home.hero.trustData', lang).replace('{year}', String(new Date().getFullYear()))}</span>
    </div>
  </div>

  <div class="hidden lg:block relative reveal-up reveal-delay-2">
    <div class="receipt relative p-6">
      <span class="receipt-chip">{t('home.hero.receiptChip', lang)}</span>
      <div class="receipt-head"><span>{t('home.hero.receiptTitle', lang)}</span><span class="text-brand-blue">{t('home.hero.receiptLive', lang)}</span></div>
      <div class="receipt-row"><span>{t('home.hero.receiptPrice', lang)}</span><b>300.000 €</b></div>
      <div class="receipt-row"><span>{t('home.hero.receiptDown', lang)}</span><b>60.000 €</b></div>
      <div class="receipt-row"><span>{t('home.hero.receiptItp', lang)}</span><b>18.000 €</b></div>
      <div class="receipt-row"><span>{t('home.hero.receiptTerm', lang)}</span><b>{t('home.hero.receiptTermValue', lang)}</b></div>
      <div class="receipt-total">
        <span class="receipt-label">{t('home.hero.receiptTotal', lang)}</span>
        <span class="receipt-num" data-countup="1247" data-suffix=" €">0 €</span>
      </div>
    </div>
  </div>
</section>

<script>
  function runCountUps() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll<HTMLElement>('[data-countup]').forEach((el) => {
      if (el.dataset.done) return;
      const target = Number(el.dataset.countup);
      const suffix = el.dataset.suffix ?? '';
      const decimals = Number(el.dataset.decimals ?? 0);
      const render = (v: number) => {
        el.textContent = v.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      };
      if (reduced) { el.dataset.done = '1'; render(target); return; }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || el.dataset.done) return;
          el.dataset.done = '1';
          io.unobserve(el);
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / 1400, 1);
            render(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }
  runCountUps();
  document.addEventListener('astro:page-load', runCountUps);
</script>
```

(El script es genérico por `[data-countup]`: sirve también a StatsStrip sin duplicarse — Astro deduplica `<script>` procesados, y aunque StatsStrip no lo incluye, vive en la misma página que Hero.)

- [ ] **Step 3: Crear `src/components/home/StatsStrip.astro`**

```astro
---
import { t } from '../../utils/i18n';
import { euriborData } from '../../constants/euribor-values';
export interface Props { lang?: 'es' | 'en'; }
const { lang = 'es' } = Astro.props;
const euribor = euriborData[euriborData.length - 1].value;
---
<section class="w-full pl-card grid grid-cols-2 md:grid-cols-4 overflow-hidden mb-14 reveal-up">
  <div class="px-6 py-5 border-r border-line max-md:border-b">
    <div class="font-heading text-2xl font-bold text-brand-blue">
      <span data-countup={euribor} data-decimals="2" data-suffix="%">0%</span>
    </div>
    <div class="font-data text-[10.5px] uppercase tracking-widest text-ink-soft mt-1">{t('home.stats.euriborLabel', lang)}</div>
  </div>
  <div class="px-6 py-5 md:border-r border-line max-md:border-b">
    <div class="font-heading text-2xl font-bold text-ink"><span data-countup="17">0</span></div>
    <div class="font-data text-[10.5px] uppercase tracking-widest text-ink-soft mt-1">{t('home.stats.ccaaLabel', lang)}</div>
  </div>
  <div class="px-6 py-5 border-r border-line">
    <div class="font-heading text-2xl font-bold text-ink">100<span class="text-brand-blue">%</span></div>
    <div class="font-data text-[10.5px] uppercase tracking-widest text-ink-soft mt-1">{t('home.stats.freeLabel', lang)}</div>
  </div>
  <div class="px-6 py-5">
    <div class="font-heading text-2xl font-bold text-ink">{t('home.stats.timeValue', lang)}</div>
    <div class="font-data text-[10.5px] uppercase tracking-widest text-ink-soft mt-1">{t('home.stats.timeLabel', lang)}</div>
  </div>
</section>
```

- [ ] **Step 4: Enchufar en las dos homes**

En `src/pages/index.astro`: `<Hero lang="es" />` (quitar props `title`/`description`, ya no existen) seguido de `<StatsStrip lang="es" />`. Igual en `src/pages/en/index.astro` con `lang="en"`. Importar `StatsStrip`.

- [ ] **Step 5: Verificar**

`npm run build` → exit 0. Capturas `/` y `/en/` a 1920 y 390.
Aceptación: subrayador lima anima sobre «por fin claros», recibo con chip colgante y count-up de 1.247 €, 4 stats con divisores, EN traducido, sin desbordes en móvil (recibo oculto en `<lg`).

- [ ] **Step 6: Commit**

```bash
git add src/components/home src/messages src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(redesign): hero with receipt card and stats strip"
```

---

### Task 4: Home — herramientas, sala de datos (Euríbor), banda broker y bloque SEO

**Files:**
- Modify: `src/components/home/Herramientas.astro`
- Modify: `src/components/home/EuriborChart.tsx`
- Create: `src/components/home/BrokerBand.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro` (añadir `<BrokerBand>` antes del bloque SEO; remaquetar bloque SEO)
- Modify: `src/messages/es.json`, `src/messages/en.json` (claves `home.broker.*`, `home.dataRoom.*`)

**Interfaces:**
- Consumes: `.pl-card`, `.pl-card-hover`, `.icon-chip`, `.arrow-chip`, `.data-room`, `.eyebrow`, `.cta-broker` (vía `ContactButton`), `AnimatedNumber` no se usa aquí.
- Produces: claves `home.broker.title`, `home.broker.titleEm`, `home.broker.description`, `home.dataRoom.eyebrow`, `home.dataRoom.title`, `home.dataRoom.titleEm`, `home.dataRoom.meta`.

- [ ] **Step 1: Claves i18n**

`es.json`:

```json
"broker": {
  "title": "Tus números están bien.",
  "titleEm": "Un broker los mejora.",
  "description": "Compara tu simulación con ofertas reales de banca. Gratis, sin compromiso y con respuesta en 24 horas."
},
"dataRoom": {
  "eyebrow": "Sala de datos",
  "title": "El euríbor,",
  "titleEm": "a la baja",
  "meta": "Serie 2000—{year} · Fuente: euribor-rates.eu · Aprox. anual"
}
```

`en.json`: `"title": "Your numbers are good.", "titleEm": "A broker makes them better.", "description": "Compare your simulation with real bank offers. Free, no strings attached, reply within 24 hours."`, `"dataRoom": { "eyebrow": "Data room", "title": "Euribor,", "titleEm": "heading down", "meta": "Series 2000—{year} · Source: euribor-rates.eu · Yearly approx." }`.

- [ ] **Step 2: Restyle `src/components/home/Herramientas.astro`**

Cambios de clases (estructura y lógica intactas): contenedor `max-w-[1920px] mx-auto py-12` → `py-4`; título a `font-heading text-3xl md:text-[34px] font-semibold tracking-[-1px] text-ink`; párrafo a `text-ink-soft`. Cada tarjeta activa: `surface-card … hover:-translate-y-1 hover:shadow-xl` → `pl-card pl-card-hover group p-7 flex flex-col items-start relative`. Icono: contenedor `mb-5 w-11 h-11 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 …` → `icon-chip mb-4` (Icon `class="text-ink"`). Título tarjeta → `font-heading text-[23px] font-semibold text-ink mb-2`. Descripción → `text-sm text-ink-soft leading-relaxed mb-4`. Chips "2-3 min / Interactiva" → `font-data text-[10px] uppercase tracking-wide border border-line rounded-full px-2.5 py-1 text-ink-soft`. El «Saber más →» se sustituye por flecha circular absoluta:

```astro
<span class="arrow-chip absolute top-6 right-6 text-ink" aria-hidden="true">→</span>
```

Tarjeta inactiva: mismas sustituciones con `opacity-60` conservado.

- [ ] **Step 3: Tema oscuro en `src/components/home/EuriborChart.tsx`**

Envolver en sala de datos y cambiar SOLO opciones de estilo del `option` (datos/series intactos):

- `title`: eliminar (el título pasa al maquetado exterior).
- `tooltip`: `backgroundColor: "#171B26"`, `borderColor: "rgba(217,242,79,.4)"`, `textStyle: { color: "#FAF9F4", fontFamily: "IBM Plex Mono" }`.
- `xAxis`/`yAxis`: `axisLine.lineStyle.color: "rgba(250,249,244,.25)"`, `axisLabel: { color: "rgba(250,249,244,.6)", fontFamily: "IBM Plex Mono", fontSize: 11 }`, `splitLine.lineStyle.color: "rgba(250,249,244,.08)"`.
- `series[0]`: `lineStyle: { color: "#D9F24F", width: 2.5 }`, `itemStyle: { color: "#D9F24F", borderColor: "#171B26", borderWidth: 2, shadowColor: "rgba(217,242,79,.6)", shadowBlur: 8 }`, `areaStyle: { color: "rgba(217,242,79,.12)" }`, y añadir `animationDuration: 2200, animationEasing: "cubicOut"`.

JSX del return:

```tsx
return (
  <section className="w-full my-14 reveal-up">
    <div className="data-room p-6 md:p-10">
      <span className="eyebrow">{t('home.dataRoom.eyebrow')}</span>
      <h2 className="font-heading text-3xl md:text-[34px] font-semibold tracking-[-1px] text-paper mt-3">
        {t('home.dataRoom.title')} <em className="not-italic text-lime">{t('home.dataRoom.titleEm')}</em>
      </h2>
      <p className="font-data text-xs text-paper/50 mt-1 mb-6">
        {t('home.dataRoom.meta').replace('{year}', String(new Date().getFullYear()))}
      </p>
      <ReactECharts option={option} style={{ height: 380, width: "100%" }} />
      <div className="font-data text-[11px] text-paper/50 mt-3 text-center">
        {t('home.hero.source')}:{" "}
        <a href="https://www.euribor-rates.eu/en/euribor-rates-by-year/" target="_blank" rel="noopener noreferrer" className="underline text-lime/80">
          euribor-rates.eu
        </a>{" "}
        {t('home.hero.approximateAnnual')}
      </div>
    </div>
  </section>
)
```

- [ ] **Step 4: Crear `src/components/home/BrokerBand.astro`**

```astro
---
import { t } from '../../utils/i18n';
import ContactButton from '../ContactButton';
export interface Props { lang?: 'es' | 'en'; }
const { lang = 'es' } = Astro.props;
---
<section class="w-full data-room px-8 py-9 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 my-4 reveal-up">
  <div>
    <h2 class="font-heading text-[26px] md:text-[27px] font-semibold tracking-[-0.5px] text-paper">
      {t('home.broker.title', lang)} <em class="not-italic text-lime">{t('home.broker.titleEm', lang)}</em>
    </h2>
    <p class="text-sm text-paper/60 max-w-[52ch] mt-2">{t('home.broker.description', lang)}</p>
  </div>
  <ContactButton client:visible variant="desktop" className="shrink-0 !px-7 !py-4 !text-[15px]" />
</section>
```

- [ ] **Step 5: Recomponer las homes y remaquetar bloque SEO**

En `src/pages/index.astro` el orden queda: `PageTracking` → `Hero` → `StatsStrip` → `Herramientas` → `EuriborChart` → `BrokerBand` → sección SEO. La sección SEO conserva EXACTAMENTE sus párrafos y `<strong>`, cambiando solo el wrapper:

```astro
<section class="w-full max-w-4xl mx-auto py-14">
  <span class="eyebrow">Sobre Hipotecalc</span>
  <h2 class="font-heading text-2xl md:text-3xl font-semibold text-ink mt-3 mb-6">
    Tu calculadora hipotecaria de confianza en España
  </h2>
  <div class="text-ink-soft space-y-4 leading-relaxed md:columns-2 md:gap-10 [&>p]:break-inside-avoid">
    …(párrafos actuales sin cambios)…
  </div>
</section>
```

Espejo en `src/pages/en/index.astro` (eyebrow «About Hipotecalc»).

- [ ] **Step 6: Verificar**

`npm run build` → exit 0. Capturas full-page `/` y `/en/` a 1920.
Aceptación: tarjetas herramientas con flecha que gira y se pinta lima al hover (verificar con `npx playwright screenshot` + estado hover manual en dev), sala de datos oscura con línea lima, banda broker con el 2º y último CTA lima de la página (contar: navbar + banda = 2), SEO a dos columnas en desktop.

- [ ] **Step 7: Commit**

```bash
git add src/components/home src/pages/index.astro src/pages/en/index.astro src/messages
git commit -m "feat(redesign): tools cards, dark euribor data room and broker band"
```

---

### Task 5: Calculadora hipotecaria — página + recibo sticky (ES y EN)

**Files:**
- Modify: `src/pages/calculadora-hipotecaria.astro` y `src/pages/en/mortgage-calculator.astro` (cabecera)
- Modify: `src/components/calculadora-hipotecaria/MortgageCalculator.tsx` (shell + aside)
- Modify: `src/components/calculadora-hipotecaria/Input.tsx`, `Select.tsx`, `Modal.tsx`, `SensitivityTable.tsx`, `MortgageSummaryCharts.tsx` (clases)
- Modify: `src/components/seo/Breadcrumbs.astro`, `src/components/seo/FAQSection.astro` (clases)
- Modify: `src/messages/es.json`, `src/messages/en.json` (clave `mortgage.results.improveCta`)

**Interfaces:**
- Consumes: `.receipt*`, `.input-pl`, `.label-pl`, `.pl-card`, `AnimatedNumber`, `ContactButton variant="receipt" labelKey="mortgage.results.improveCta"`.
- Produces: patrón de página de calculadora que Task 6 replica.

- [ ] **Step 1: Clave i18n**

`es.json` → en `mortgage.results`: `"improveCta": "Mejorar esta cuota"`. `en.json`: `"improveCta": "Improve this payment"`.

- [ ] **Step 2: Cabecera de página (`calculadora-hipotecaria.astro:22-34`)**

```astro
<div class="w-full py-8">
  <div class="text-center mb-8 reveal-up">
    <span class="eyebrow">{t('mortgage.title')}</span>
    <h1 class="font-heading text-3xl md:text-4xl lg:text-[44px] font-semibold tracking-[-1px] text-ink mt-4 mb-3">
      Calculadora Hipotecaria España {new Date().getFullYear()}
    </h1>
    <p class="text-ink-soft max-w-3xl mx-auto text-base md:text-lg">{t('mortgage.description')}</p>
  </div>
  <div class="reveal-up reveal-delay-1">
    <MortgageCalculator client:load />
  </div>
</div>
```

(Eliminar `ambient-section`, `ambient-content`, `max-w-[1920px]` y el badge píldora azul. El `<main>` de página pasa a `<div>` — ya hay `<main>` en Layout.) Las secciones SEO inferiores de la página: mismo tratamiento del wrapper que Task 4 Step 5 (eyebrow + `max-w-4xl`, sin `px-4` porque `<main>` ya lo da). Espejo EN.

- [ ] **Step 3: Shell y aside de `MortgageCalculator.tsx`**

- Línea 276: `calculator-shell flex flex-col xl:flex-row gap-6 p-4 md:p-6 mt-8` → `flex flex-col xl:flex-row gap-6 mt-4 items-start`.
- Línea 278: el form container `flex-1 section-card p-5 md:p-6` → `flex-1 pl-card p-5 md:p-6`.
- Fieldsets (282, 330, 473): `section-card p-4` → `rounded-xl border border-line bg-paper/50 p-4`; sus `<legend>` a `font-data text-[11px] uppercase tracking-widest text-ink-soft px-1`.
- Línea 627 (aside): `w-full xl:w-[22rem] panel-card p-5 md:p-6 flex flex-col gap-5` → `w-full xl:w-[22rem] receipt p-6 flex flex-col gap-4 xl:sticky xl:top-24`.
- Dentro del aside: título «Tu cuota mensual» → `<div class="receipt-head"><span>{t('mortgage.results.title')}</span><span class="text-brand-blue">■</span></div>`; la cifra grande de cuota pasa a `<AnimatedNumber value={cuotaMensual} suffix=" €" className="receipt-num" />` dentro de `receipt-total`; las filas de desglose (cantidad hipoteca, % financiación, coste total…) → `receipt-row`. El `ContactButton` existente del aside → `<ContactButton variant="receipt" labelKey="mortgage.results.improveCta" />` colocado INMEDIATAMENTE después del `receipt-total` de la cuota.
- Cualquier `kpi-card`/`metric-row` en el fichero → `rounded-xl border border-line bg-paper/60` / `receipt-row` según sea tarjeta o fila.

- [ ] **Step 4: Inputs y Select**

`Input.tsx`: la clase del `<input>` pasa a `input-pl` (+ `pr-8` si `showEuroSymbol`); la del `<label>` a `label-pl`. `Select.tsx` (ambas copias: `calculadora-hipotecaria/` y `calculadora-alquiler/`): `<select>` a `input-pl cursor-pointer`, label a `label-pl`. `Modal.tsx`: contenedor a `pl-card shadow-2xl`, título a `font-heading font-semibold text-ink`. `SensitivityTable.tsx` y `MortgageSummaryCharts.tsx`: contenedores `section-card`/`surface-card` → `pl-card`; celdas destacadas usan `font-data`.

- [ ] **Step 5: Breadcrumbs y FAQ**

`Breadcrumbs.astro`: lista a `font-data text-[11px] uppercase tracking-wide text-ink-soft`, separadores `/`, link activo `text-ink`. `FAQSection.astro`: contenedor `pl-card p-6`, preguntas `font-heading font-semibold text-ink`, respuestas `text-ink-soft` (estructura/schema JSON-LD intactos).

- [ ] **Step 6: Verificar**

`npm run build` → exit 0. En dev, `/calculadora-hipotecaria`: captura 1920 y 390.
Aceptación: recibo sticky visible al cargar (sin scroll), cuota anima al cambiar «Precio de la vivienda» (probar tecleando 250000), CTA «Mejorar esta cuota» lima bajo la cifra, exactamente 2 CTAs lima en la página, inputs ~420-480px de ancho, focus azul. Espejo EN funcional.

- [ ] **Step 7: Commit**

```bash
git add src/components/calculadora-hipotecaria src/components/seo src/pages src/messages
git commit -m "feat(redesign): mortgage calculator with sticky receipt and lime CTA"
```

---

### Task 6: Calculadora de alquiler — relayout con recibo sticky (ES y EN)

**Files:**
- Modify: `src/components/calculadora-alquiler/RentalCalculator.tsx` (relayout completo del return, líneas 123-277)
- Modify: `src/components/calculadora-alquiler/RentalKPIs.tsx`, `RentalCharts.tsx`, `Input.tsx` (clases)
- Modify: `src/pages/calculadora-alquiler.astro`, `src/pages/en/rental-calculator.astro` (cabecera, patrón Task 5 Step 2)
- Modify: `src/messages/es.json`, `src/messages/en.json` (clave `rental.results.improveCta`)

**Interfaces:**
- Consumes: patrón de Task 5; `AnimatedNumber`; `ContactButton variant="receipt" labelKey="rental.results.improveCta"`; cálculos existentes `calculations.cashFlowMensual`, `calculations.roi`, etc. (no se tocan).

- [ ] **Step 1: Clave i18n**

`es.json` → `rental.results.improveCta: "Mejorar esta inversión"`; `en.json`: `"Improve this investment"`.

- [ ] **Step 2: Relayout del return de `RentalCalculator.tsx`**

Estructura nueva (línea 123):

```tsx
<div className="flex flex-col xl:flex-row gap-6 mt-4 items-start">
  {/* Formulario: 2 tarjetas en columna, ocupa el ancho restante */}
  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
    <div className="pl-card p-5 md:p-6">{/* tarjeta Detalles de la propiedad: contenido actual, labels/inputs ya restilizados por Task 5 Step 4 */}</div>
    <div className="pl-card p-5 md:p-6">{/* tarjeta Detalles del alquiler: contenido actual */}</div>
  </div>

  {/* Recibo sticky */}
  <aside className="w-full xl:w-[22rem] receipt p-6 flex flex-col gap-2 xl:sticky xl:top-24">
    <div className="receipt-head">
      <span>{t('rental.results.title')}</span>
      <span className="text-brand-blue">■</span>
    </div>
    <div className="receipt-row">
      <span>{t('rental.form.monthlyIncome')}</span>
      <b>{formatCurrency(calculations.ingresosMensuales)}</b>
    </div>
    <div className="receipt-row">
      <span>ITP ({calculations.porcentajeITP}%)</span>
      <b>{formatCurrency(calculations.itp)}</b>
    </div>
    <div className="receipt-row">
      <span>{t('mortgage.form.monthlyPaymentLabel')}</span>
      <b>{formatCurrency(calculations.cuotaMensual)}</b>
    </div>
    <div className="receipt-total">
      <span className="receipt-label">{t('rental.results.cashFlowLabel')}</span>
      <AnimatedNumber
        value={calculations.cashFlowMensual}
        suffix=" €"
        className={`receipt-num ${calculations.cashFlowMensual >= 0 ? '!text-positive' : '!text-negative'}`}
      />
    </div>
    <ContactButton variant="receipt" labelKey="rental.results.improveCta" className="mt-3" />
  </aside>
</div>

{/* KPIs y gráficas a lo ancho, debajo */}
<div className="mt-6"><RentalKPIs calculations={calculations} lang={lang} /></div>
<div className="mt-6"><RentalCharts calculations={calculations} form={form} lang={lang} /></div>
```

(Los nombres exactos de propiedades de `calculations` y helpers `formatCurrency`/claves `t()` son los ya usados en el fichero actual líneas 184-263 — reutilizarlos tal cual; los `metric-row` intermedios de las tarjetas de formulario desaparecen porque el recibo ya muestra esos datos.)

- [ ] **Step 3: KPIs y charts**

`RentalKPIs.tsx`: cada KPI → `pl-card p-4` con valor `font-heading text-2xl font-bold text-ink` (positivo/negativo con `text-positive`/`text-negative`) y label `font-data text-[10.5px] uppercase tracking-widest text-ink-soft`. `RentalCharts.tsx`: contenedores → `pl-card p-5`; opciones echarts: ejes/labels a `#4A5061` con `fontFamily: "IBM Plex Mono"`, series a paleta `#2A4CF0` (principal) / `#1FA55A` (positivo) / `#171B26` (neutro); tooltips fondo `#171B26` texto `#FAF9F4`.

- [ ] **Step 4: Cabeceras de página ES/EN**

Aplicar patrón Task 5 Step 2 a `calculadora-alquiler.astro` y `en/rental-calculator.astro`.

- [ ] **Step 5: Verificar**

`npm run build` → exit 0. Capturas `/calculadora-alquiler` 1920/390.
Aceptación: recibo sticky visible al cargar con cash flow en grande (verde con datos positivos: probar precio 200000, entrada 40000, alquiler 1200 → cash flow verde), CTA lima bajo la cifra, 2 CTAs lima exactos, KPIs y gráficas debajo con la nueva paleta, móvil apila formulario → recibo → KPIs.

- [ ] **Step 6: Commit**

```bash
git add src/components/calculadora-alquiler src/pages src/messages
git commit -m "feat(redesign): rental calculator relayout with sticky cash-flow receipt"
```

---

### Task 7: Barrido final — restos, limpieza y verificación completa

**Files:**
- Modify: cualquier resto que aparezca en el grep del Step 1
- Delete: `VISUAL_UPGRADE_PLAN.md`, `src/components/CriticalCSS.astro` (no se importa en ningún sitio; contiene CSS del diseño viejo)
- Modify: `src/layouts/Layout.astro` (quitar script de font-loading obsoleto, líneas 276-298, y clases `font-loading-stable` si quedan)

- [ ] **Step 1: Grep de clases muertas**

Run: `grep -rn "surface-card\|surface-nav\|btn-primary\|btn-secondary\|calculator-shell\|section-card\|panel-card\|kpi-card\|metric-row\|ambient-\|float-soft\|max-w-\[1920px\]\|font-heading text-.*extrabold\|Manrope" src/`
Expected: 0 resultados. Cada hit que salga se corrige con la receta equivalente de las tasks 2-6 (`pl-card`, `btn-ink`, etc.).

- [ ] **Step 2: Limpiar Layout y borrar plan viejo**

Quitar el `<script>` de font-loading (Layout.astro:276-298) — Fraunces/Inter con `display=swap` no lo necesitan. `git rm VISUAL_UPGRADE_PLAN.md src/components/CriticalCSS.astro`.

- [ ] **Step 3: Build final + matriz de capturas**

```bash
npm run build
```
Expected: exit 0. Después, con dev server: capturas de las 6 rutas (`/`, `/calculadora-hipotecaria`, `/calculadora-alquiler`, `/en/`, `/en/mortgage-calculator`, `/en/rental-calculator`) × 3 viewports (1920×1080, 1440×900, 390×844), full-page.

- [ ] **Step 4: Checklist de aceptación de la spec**

- [ ] Navbar despegada de bordes en 1920 y 1440.
- [ ] Contenido centrado a 1280px en todas las rutas.
- [ ] Exactamente 2 elementos lima por página (inspeccionar capturas).
- [ ] Recibo sticky visible al cargar en ambas calculadoras.
- [ ] Count-ups funcionan y `prefers-reduced-motion` los desactiva (probar con `npx playwright screenshot --reduced-motion=reduce`).
- [ ] EN completo sin claves sin traducir (grep visual de capturas EN).
- [ ] Sin regresión SEO: `grep -c "application/ld+json" dist/index.html` ≥ 1; títulos h1/h2 presentes en dist.

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat(redesign): final sweep, remove legacy styles and visual plan"
```
