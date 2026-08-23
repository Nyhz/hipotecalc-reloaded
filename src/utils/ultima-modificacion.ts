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

/**
 * La más reciente de las fechas de último commit de varios ficheros. Para
 * páginas cuyo resultado depende de ficheros de datos además del propio
 * (p. ej. las calculadoras, que muestran los tipos de comunidades.ts): su
 * «última revisión» debe avanzar también cuando se revisan los datos.
 */
export function ultimaModificacionConjunta(
  ...ficheros: string[]
): Date | undefined {
  const fechas = ficheros
    .map(ultimaModificacion)
    .filter((d): d is Date => d !== undefined)
  if (fechas.length === 0) return undefined
  return fechas.reduce((a, b) => (b > a ? b : a))
}

/** Fecha del PRIMER commit del fichero (fecha real de publicación). */
export function fechaPublicacion(ficheroFuente: string): Date | undefined {
  try {
    const out = execSync(
      `git log --diff-filter=A --follow --format=%cs -- "${ficheroFuente}" | tail -1`,
      { encoding: 'utf8' }
    ).trim()
    return out ? new Date(out) : undefined
  } catch {
    return undefined
  }
}
