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
  if (pathname.startsWith('/en/')) {
    return 'en'
  }
  return 'es'
}

export function getAlternateLang(currentLang: Language): Language {
  return currentLang === 'es' ? 'en' : 'es'
}

export function getAlternatePath(pathname: string): string {
  const currentLang = getCurrentLang(pathname)
  const alternateLang = getAlternateLang(currentLang)
  
  if (currentLang === 'es') {
    // Convert Spanish path to English path
    if (pathname === '/') return '/en/'
    if (pathname === '/calculadora-hipotecaria') return '/en/mortgage-calculator'
    if (pathname === '/calculadora-alquiler') return '/en/rental-calculator'
  } else {
    // Convert English path to Spanish path
    if (pathname === '/en/') return '/'
    if (pathname === '/en/mortgage-calculator') return '/calculadora-hipotecaria'
    if (pathname === '/en/rental-calculator') return '/calculadora-alquiler'
  }
  
  return pathname
}
