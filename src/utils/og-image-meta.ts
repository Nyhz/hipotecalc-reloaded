import { readFileSync } from 'node:fs'

export interface OgImageMeta {
  width: number
  height: number
  type: string
}

/**
 * Dimensiones y MIME reales de una imagen de /public, leyendo el fichero en
 * build. Evita declarar og:image:width/height/type fijos cuando cada página
 * puede llevar una imagen distinta (mapas 1800×1238, gráficos 1800×1012, el
 * OG por defecto 1200×630…). PNG: IHDR; JPEG: primer marcador SOF.
 */
export function ogImageMeta(rutaPublica: string): OgImageMeta | undefined {
  try {
    const buf = readFileSync(`public${rutaPublica}`)
    if (rutaPublica.endsWith('.png')) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), type: 'image/png' }
    }
    if (/\.jpe?g$/i.test(rutaPublica)) {
      let i = 2
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue }
        const marcador = buf[i + 1]
        // SOF0–SOF15 salvo DHT (C4), JPG (C8) y DAC (CC)
        if (marcador >= 0xc0 && marcador <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marcador)) {
          return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5), type: 'image/jpeg' }
        }
        const len = buf.readUInt16BE(i + 2)
        i += 2 + len
      }
    }
  } catch { /* fichero ausente o formato no soportado */ }
  return undefined
}
