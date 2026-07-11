import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Blog: cualquier .md dentro de src/content/blog/ se publica automáticamente
// con el deploy. Frontmatter mínimo: title, description, pubDate.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Título corto para la etiqueta <title> (si no, se usa title + sufijo)
    seoTitle: z.string().optional(),
    // Preguntas frecuentes: se muestran ya dentro del contenido del artículo;
    // este campo solo alimenta el JSON-LD FAQPage (rich snippet en Google)
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    // Serie temática: los posts con serie "euribor" (análisis mensuales)
    // se listan también en la página /euribor. Keystatic escribe "" cuando
    // no hay serie seleccionada.
    serie: z.enum(['euribor']).or(z.literal('')).optional(),
  }),
})

// Guías generales (amortización, gastos, TIN/TAE...): .md en la raíz de
// src/content/guias/ — el subdirectorio itp/ tiene su propia colección.
// `calculadora` indica qué herramienta se incrusta al final de la guía.
const guias = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guias' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedDate: z.coerce.date(),
    calculadora: z.enum(['hipoteca', 'itp', 'prestamo']).optional(),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
  }),
})

// Guías ITP: un .md por comunidad autónoma en src/content/guias/itp/.
// El slug del fichero es la URL (/itp/<slug>). `comunidad` debe coincidir
// exactamente con el nombre en src/constants/comunidades.ts para precargar
// la calculadora.
const itp = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guias/itp' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    comunidad: z.string(),
    tipoGeneral: z.string(),
    resumen: z.string(),
    updatedDate: z.coerce.date(),
  }),
})

export const collections = { blog, itp, guias }
