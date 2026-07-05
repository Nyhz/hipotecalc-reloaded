import { config, collection, fields } from '@keystatic/core'

// CMS git-based: los artículos son ficheros .md en src/content/blog/.
// Puedes crearlos a mano (frontmatter: title, description, pubDate) o desde
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
        content: fields.markdoc({
          label: 'Contenido',
          extension: 'md',
        }),
      },
    }),
  },
})
