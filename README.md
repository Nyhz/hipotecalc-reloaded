<div align="center">

# hipotecalc.

**Los números de tu casa, por fin claros.**

Calculadoras financieras para España: hipoteca, ITP por comunidad autónoma
y rentabilidad del alquiler. Gratis, sin registro y con datos oficiales al día.

[hipotecalc.com](https://www.hipotecalc.com) · [English](https://www.hipotecalc.com/en/)

</div>

---

## Qué hace

- **Calculadora hipotecaria** — cuota mensual, coste total, desglose de intereses y análisis de sensibilidad. Hipoteca fija o variable con el euríbor real.
- **Calculadora de ITP avanzada** — los tipos de las 17 comunidades más Ceuta y Melilla, con tramos progresivos, tipos reducidos y bonificaciones: jóvenes, familia numerosa, discapacidad, zonas despobladas o el VMA del País Vasco.
- **Calculadora de alquiler** — ROI anual, cash flow mensual y tiempo de recuperación de la inversión.
- **Euríbor siempre al día** — una GitHub Action mensual descarga la serie oficial del BCE, regenera los datos y despliega sola. Cero mantenimiento.

## Stack

Astro 5 · React 19 · Tailwind CSS 4 · ECharts · Vercel

Sitio 100% estático: las calculadoras son islas React que hidratan sobre HTML
pre-renderizado. Bilingüe ES/EN, SEO con datos estructurados (FAQPage,
WebApplication) y og:image por idioma.

## Desarrollo

```bash
npm install
npm run dev      # localhost:4321
npm run build    # producción en ./dist
```

Push a `develop` → deploy automático en Vercel.

## Datos

| Dato | Fuente | Actualización |
| --- | --- | --- |
| Euríbor 12M | [BCE Data Portal](https://data.ecb.europa.eu/data/datasets/FM/FM.M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA) | Automática — Action mensual ([workflow](.github/workflows/update-euribor.yml)) |
| Tipos ITP / IVA | Normativa autonómica y foral | Manual — `src/constants/comunidades.ts` |
