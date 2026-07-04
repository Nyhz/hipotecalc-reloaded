import es from '../messages/es.json'
import en from '../messages/en.json'

const messages = {
  es,
  en
}

export type Language = 'es' | 'en'

export function t(key: string, lang: Language = 'es'): string {
  const keys = key.split('.')
  let value: any = messages[lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      console.warn(`Translation key not found: ${key} for language: ${lang}`)
      return key
    }
  }
  
  return typeof value === 'string' ? value : key
}

export function getCurrentLang(pathname: string): Language {
  // La home inglesa se sirve como '/en' (sin barra final) en producción
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return 'en'
  }
  return 'es'
}

export function getAlternateLang(currentLang: Language): Language {
  return currentLang === 'es' ? 'en' : 'es'
}

// Normaliza a la forma canónica sin barra final (salvo la raíz), que es como
// sirve las URLs producción (vercel.json trailingSlash: false)
export function normalizePath(pathname: string): string {
  if (pathname === '/') return pathname
  return pathname.replace(/\/+$/, '')
}

export function getAlternatePath(pathname: string): string {
  const normalized = normalizePath(pathname)
  const currentLang = getCurrentLang(normalized)

  if (currentLang === 'es') {
    if (normalized === '/') return '/en'
    if (normalized === '/calculadora-hipotecaria') return '/en/mortgage-calculator'
    if (normalized === '/calculadora-alquiler') return '/en/rental-calculator'
    if (normalized === '/aviso-legal') return '/en/legal-notice'
    if (normalized === '/politica-de-privacidad') return '/en/privacy-policy'
    if (normalized === '/politica-de-cookies') return '/en/cookie-policy'
    if (normalized === '/disclaimer-financiero') return '/en/financial-disclaimer'
  } else {
    if (normalized === '/en') return '/'
    if (normalized === '/en/mortgage-calculator') return '/calculadora-hipotecaria'
    if (normalized === '/en/rental-calculator') return '/calculadora-alquiler'
    if (normalized === '/en/legal-notice') return '/aviso-legal'
    if (normalized === '/en/privacy-policy') return '/politica-de-privacidad'
    if (normalized === '/en/cookie-policy') return '/politica-de-cookies'
    if (normalized === '/en/financial-disclaimer') return '/disclaimer-financiero'
  }

  return pathname
}
