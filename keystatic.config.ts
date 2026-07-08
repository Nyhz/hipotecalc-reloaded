import { config, collection, fields } from '@keystatic/core'

// CMS git-based: los artículos son ficheros .md en src/content/blog/ y las
// guías del ITP en src/content/guias/itp/. Puedes crearlos a mano o desde
// el panel visual en http://localhost:4321/keystatic durante `npm run dev`.
// El panel escribe los .md en el repo; al hacer commit + push se publican
// con el deploy. No forma parte del build de producción.
export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: { name: 'Hipotecalc' },
  },
  collections: {
    blog: collection({
      label: 'Artículos del blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      fields: {
        title: fields.slug({
          name: { label: 'Título', validation: { isRequired: true } },
        }),
        description: fields.text({
          label: 'Descripción (SEO)',
          multiline: true,
          validation: { isRequired: true },
        }),
        pubDate: fields.date({
          label: 'Fecha de publicación',
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: 'Última actualización (opcional)',
        }),
        seoTitle: fields.text({
          label: 'Título SEO corto (opcional, para la etiqueta <title>)',
        }),
        faq: fields.array(
          fields.object({
            question: fields.text({ label: 'Pregunta' }),
            answer: fields.text({ label: 'Respuesta', multiline: true }),
          }),
          {
            label: 'FAQ (rich snippet, opcional)',
            itemLabel: (props) => props.fields.question.value || 'Pregunta',
          }
        ),
        content: fields.markdoc({
          label: 'Contenido',
          extension: 'md',
        }),
      },
    }),
    itp: collection({
      label: 'Guías ITP por comunidad',
      slugField: 'title',
      path: 'src/content/guias/itp/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      fields: {
        title: fields.slug({
          name: { label: 'Título', validation: { isRequired: true } },
        }),
        description: fields.text({
          label: 'Descripción (SEO)',
          multiline: true,
          validation: { isRequired: true },
        }),
        comunidad: fields.text({
          label: 'Comunidad (nombre exacto en comunidades.ts, para la calculadora)',
          validation: { isRequired: true },
        }),
        tipoGeneral: fields.text({
          label: 'Tipo general 2026 (p. ej. "6 %")',
          validation: { isRequired: true },
        }),
        resumen: fields.text({
          label: 'Resumen de reducciones (para el cuadro comparativo)',
          multiline: true,
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: 'Última verificación de la normativa',
          validation: { isRequired: true },
        }),
        content: fields.markdoc({
          label: 'Contenido',
          extension: 'md',
        }),
      },
    }),
  },
})
