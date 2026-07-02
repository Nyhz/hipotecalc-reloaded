# Rediseño Hipotecalc — «Papel y lima»

**Fecha:** 2026-07-02 · **Rama:** `feat/visual-polish-review` · **Estado:** aprobado por Daniel (dirección A, iterada en visual companion v1→v3 + selección entre 4 identidades)

## Objetivo

Rediseño visual completo de la web (landing + 2 calculadoras, ES y EN): nueva línea editorial, tipografía, iconografía, animación y estructura de secciones. Debe parecer otra web. Prioridad nº 1 de negocio: la conversión hacia el CTA de contacto con broker. Sin cambios de lógica de cálculo, rutas, SEO estructural ni analítica.

## Decisiones cerradas durante el brainstorming

1. **Ancho**: el contenido vive en una columna centrada de **1280px** (`max-w-7xl`); el fondo ocupa todo el viewport. Sustituye al `max-w-[1920px]` actual. Los formularios quedan con inputs de ~400–480px.
2. **Bug navbar**: la nav actual no tiene padding lateral y choca con los bordes; la nueva nav lo corrige de serie.
3. **Calculadora de alquiler**: pasa al patrón de la hipotecaria — formulario a la izquierda, **panel de resultados sticky** a la derecha, gráficas a lo ancho debajo.
4. **CTAs de broker — regla de oro**: máximo **2 por página**, y el color lima es EXCLUSIVO de este CTA.
   - Home: navbar + banda de cierre oscura.
   - Calculadoras: navbar + botón «Mejorar esta cuota» dentro del panel de resultados, pegado a la cifra.
   - El hero de la home vende el producto: primario tinta «Calcular mi hipoteca», secundario borde «Rentabilidad de alquiler».
5. **Identidad elegida**: A · «Papel y lima» (frente a Nocturna, Suizo cobalto y Mediterráneo).

## Identidad visual

### Tokens

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#FAF9F4` | fondo global, con retícula milimetrada sutil (`rgba(23,27,38,.035)`, celda 44px) |
| `--card` | `#FFFFFF` | tarjetas |
| `--ink` | `#171B26` | texto, botón primario, banda broker, footer |
| `--ink-soft` | `#4A5061` | texto secundario |
| `--line` | `rgba(23,27,38,.12)` | bordes |
| `--lime` | `#D9F24F` (hover `#CBEA33`) | SOLO CTA broker + subrayador del titular + acentos en fondos oscuros |
| `--blue` | `#2A4CF0` | números vivos, enlaces, estados activos, hover del botón tinta |
| verde vivo | `#1FA55A` | punto pulsante del CTA broker, signos positivos (cash flow) |
| radios | 16px tarjetas, 99px píldoras, 10px inputs | |
| sombras | suaves (`0 20px 44px rgba(23,27,38,.12)` panel resultados; `0 4px 14px rgba(217,242,79,.5)` CTA broker) | nada de sombras duras desplazadas |

### Tipografía (Google Fonts, `display=swap`)

- **Fraunces** (600/700, opsz auto): titulares h1–h3, logo `hipotecalc.` (punto azul), cifras grandes de resultados. Sustituye a Manrope.
- **Inter** (400–700): cuerpo, formularios, botones. Se mantiene.
- **IBM Plex Mono** (400–600): eyebrows, etiquetas de datos, cabeceras del recibo, microcopys tipo «EN VIVO». Numerales tabulares en toda cifra.

### Iconografía

Lucide (ya instalado) en trazo 1.5px, dentro de chips cuadrados 44px con borde `--line` y fondo `--paper`. Sin círculos pastel rellenos.

### Sistema de animación

- **Count-up** de cifras al entrar en viewport (easing cubic-out, ~1.4s; `IntersectionObserver`).
- **Subrayador lima** del titular del hero: `scaleX(0→1)` a los 500ms.
- **Hover tarjetas**: `translateY(-4px)` + sombra; flecha circular gira 45° y se rellena de lima.
- **Gráfica Euribor**: trazo que se dibuja al entrar en viewport.
- **Punto verde pulsante** en el CTA broker.
- Todo desactivado bajo `prefers-reduced-motion: reduce`.

## Componentes y secciones

### Navbar (todas las páginas)

Barra fija arriba sobre papel translúcido con blur, borde inferior `--line`, **con padding lateral** dentro del contenedor de 1280px. Logo Fraunces a la izquierda; centro: enlaces píldora (activo = fondo tinta, texto blanco); derecha: selector idioma discreto + **CTA broker lima** con punto pulsante. Móvil: logo + CTA broker compacto + hamburguesa; desplegable con las herramientas. Desaparece la mini-nav flotante inferior actual (el CTA del panel sticky cumple su función).

### Ticker de datos — DESCARTADO

Se valoró una franja tipo ticker bursátil bajo la nav y se descartó (2026-07-02): urgencia fingida sobre datos mensuales/estáticos, redundante con la franja de stats y el chip del recibo, mezcla categorías inconexas (índice + impuestos + media comercial) y compite en atención con el CTA lima. Cada dato vive en su contexto: Euríbor en stats y sala de datos; ITP en el desglose del recibo.

### Home

1. **Hero** (grid 1.12/0.88): eyebrow mono con raya azul → H1 Fraunces 54px «Los números de tu casa, por fin claros.» (subrayador lima en «por fin claros») → párrafo → CTAs producto (tinta + borde) → línea de confianza mono («✓ 100% gratuito · ✓ Sin registro · ✓ Datos 2026»). Derecha: **tarjeta-recibo** demo (cabecera mono «TU SIMULACIÓN ■ EN VIVO», filas precio/entrada/ITP/plazo, total «CUOTA / MES 1.247 €» con count-up, chip tinta «EURÍBOR + 1% → 2,94%» colgando). Sin CTA broker en el recibo de la home.
2. **Franja de stats**: 4 celdas con divisores de tinta sobre blanco (Euríbor actual con count-up, nº CCAA, 100% gratis, 2 min/simulación).
3. **Herramientas**: H2 Fraunces + 2 tarjetas grandes (icono chip, título Fraunces 23px, descripción, flecha circular animada al hover).
4. **Sala de datos**: sección oscura tinta con la gráfica del Euríbor (echarts restilizado: línea lima, grid tenue, tooltip oscuro), eyebrow «SALA DE DATOS», subtítulo mono con fuente y actualización.
5. **Banda broker** (cierre, fondo tinta): «Tus números están bien. *Un broker los mejora.*» (em en lima) + **CTA broker lima** (2º y último de la página).
6. **Bloque SEO** actual remaquetado en editorial: título Fraunces + dos columnas de texto con `max-width: 65ch`.
7. **Footer** tinta oscura: logo, columnas de enlaces, mono para el legal.

### Calculadora hipotecaria (`/calculadora-hipotecaria`, `/en/mortgage-calculator`)

- Cabecera compacta: breadcrumbs mono, H1 Fraunces, subtítulo corto. Sin banner de fondo azul actual.
- Grid 1.6/1: izquierda tarjetas de formulario («Vivienda», «Impuestos y costes», «Financiación») con inputs rediseñados (borde `--line`, focus azul, € como sufijo, labels 12.5px/600); derecha **recibo sticky**: cabecera mono, filas de desglose, «CUOTA / MES» en Fraunces azul 36px con count-up al cambiar, **CTA broker «Mejorar esta cuota»** a ancho completo bajo la cifra, y debajo el desglose de coste total.
- Análisis de sensibilidad y gráficas: tarjetas a lo ancho debajo, mismos tokens.
- Modal ITP: misma piel (tarjeta blanca, borde línea, títulos Fraunces).

### Calculadora de alquiler (`/calculadora-alquiler`, `/en/rental-calculator`)

- Misma cabecera y grid que la hipotecaria: formulario («Propiedad», «Alquiler») a la izquierda, **recibo sticky** a la derecha con **cash flow mensual** como cifra grande (verde `#1FA55A` positivo / rojo negativo), filas ROI, rentabilidad y años de recuperación, CTA broker debajo.
- KPIs restantes y gráficas (echarts restilizado) a lo ancho debajo.

### Copy e i18n

Nuevos microcopys en `es.json`/`en.json`: titular hero, eyebrows, línea de confianza, banda broker, cabeceras del recibo, CTA «Mejorar esta cuota». Tono: directo, primera persona del usuario, sin jerga bancaria. EN con equivalentes naturales, no literales.

## Qué NO cambia

Rutas y páginas, lógica de cálculo (`utils/`), datos (`constants/`), SEO (title/meta/schema/FAQ/breadcrumbs se remaquetan pero conservan contenido y jerarquía de headings), analítica/CookieYes, PWA/build. Se elimina el `VISUAL_UPGRADE_PLAN.md` obsoleto si estorba, no se toca `dist/`.

## Riesgos y mitigaciones

- **Fuentes nuevas (3 familias)**: cargar solo pesos usados, `preload` + `display=swap` como ahora; Fraunces con ejes limitados.
- **CLS del count-up**: cifras con `font-variant-numeric: tabular-nums` y ancho reservado.
- **echarts restilizado**: solo opciones de tema (colores/grid/tooltip), sin tocar series ni datos.

## Verificación

1. `npm run build` sin errores.
2. Playwright: capturas de las 3 páginas × 3 viewports (1920/1440/390) en ES y EN; revisar navbar despegada de bordes, recibo sticky visible al cargar en ambas calculadoras, máximo 2 CTAs lima por página.
3. Interacción manual: cambiar inputs → count-up del recibo; hover en tarjetas; `prefers-reduced-motion` desactiva animaciones.
