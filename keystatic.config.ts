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
        serie: fields.select({
          label: 'Serie temática',
          description: 'Los análisis mensuales del euríbor se listan también en /euribor',
          options: [
            { label: '(ninguna)', value: '' },
            { label: 'Análisis del euríbor', value: 'euribor' },
          ],
          defaultValue: '',
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
    guias: collection({
      label: 'Guías de hipotecas',
      slugField: 'title',
      path: 'src/content/guias/*',
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
        updatedDate: fields.date({
          label: 'Última actualización',
          validation: { isRequired: true },
        }),
        calculadora: fields.select({
          label: 'Calculadora incrustada al final',
          options: [
            { label: 'Simulador de hipoteca', value: 'hipoteca' },
            { label: 'Calculadora de ITP', value: 'itp' },
            { label: '¿Cuánto me prestan? (regla del 35 %)', value: 'prestamo' },
            { label: 'Gastos de compraventa', value: 'gastos' },
          ],
          defaultValue: 'hipoteca',
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
    blogEn: collection({
      label: 'Blog posts (English)',
      slugField: 'title',
      path: 'src/content/en/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      fields: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        description: fields.text({ label: 'Description (SEO)', multiline: true, validation: { isRequired: true } }),
        pubDate: fields.date({ label: 'Publish date', validation: { isRequired: true } }),
        updatedDate: fields.date({ label: 'Last updated (optional)' }),
        seoTitle: fields.text({ label: 'Short SEO title (optional, for the <title> tag)' }),
        serie: fields.select({
          label: 'Series',
          description: 'Monthly Euribor analyses are also listed on /en/euribor',
          options: [
            { label: '(none)', value: '' },
            { label: 'Euribor analysis', value: 'euribor' },
          ],
          defaultValue: '',
        }),
        faq: fields.array(
          fields.object({
            question: fields.text({ label: 'Question' }),
            answer: fields.text({ label: 'Answer', multiline: true }),
          }),
          { label: 'FAQ (rich snippet, optional)', itemLabel: (props) => props.fields.question.value || 'Question' }
        ),
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
    }),
    guiasEn: collection({
      label: 'Mortgage guides (English)',
      slugField: 'title',
      path: 'src/content/en/guias/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      fields: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        description: fields.text({ label: 'Description (SEO)', multiline: true, validation: { isRequired: true } }),
        updatedDate: fields.date({ label: 'Last updated', validation: { isRequired: true } }),
        calculadora: fields.select({
          label: 'Calculator embedded at the end',
          options: [
            { label: 'Mortgage calculator', value: 'hipoteca' },
            { label: 'ITP calculator', value: 'itp' },
            { label: 'How much can I borrow? (35% rule)', value: 'prestamo' },
            { label: 'Purchase costs', value: 'gastos' },
          ],
          defaultValue: 'hipoteca',
        }),
        faq: fields.array(
          fields.object({
            question: fields.text({ label: 'Question' }),
            answer: fields.text({ label: 'Answer', multiline: true }),
          }),
          { label: 'FAQ (rich snippet, optional)', itemLabel: (props) => props.fields.question.value || 'Question' }
        ),
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
    }),
    itpEn: collection({
      label: 'ITP guides by region (English)',
      slugField: 'title',
      path: 'src/content/en/guias/itp/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      fields: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        description: fields.text({ label: 'Description (SEO)', multiline: true, validation: { isRequired: true } }),
        comunidad: fields.text({ label: 'Region (exact name from comunidades.ts, in Spanish, for the calculator)', validation: { isRequired: true } }),
        tipoGeneral: fields.text({ label: 'General rate 2026 (e.g. "6 %")', validation: { isRequired: true } }),
        resumen: fields.text({ label: 'Reductions summary (for the comparison table)', multiline: true, validation: { isRequired: true } }),
        updatedDate: fields.date({ label: 'Legislation last verified', validation: { isRequired: true } }),
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
    }),
  },
})
