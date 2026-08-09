import { execSync } from 'node:child_process'

// Fecha del último commit de un fichero fuente (misma técnica que el lastmod
// del sitemap en astro.config.mjs). Se ejecuta en build; si el fichero aún no
// está commiteado devuelve undefined y el byline omite la fecha.
export function ultimaModificacion(ficheroFuente: string): Date | undefined {
  try {
    const out = execSync(`git log -1 --format=%cs -- "${ficheroFuente}"`, {
      encoding: 'utf8',
    }).trim()
    return out ? new Date(out) : undefined
  } catch {
    return undefined
  }
}
