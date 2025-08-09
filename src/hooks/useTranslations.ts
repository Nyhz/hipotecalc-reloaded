import { useState, useEffect } from 'react'
import { getCurrentLang } from '../utils/i18n'
import { t } from '../utils/i18n'

export function useTranslations(forcedLang?: 'es' | 'en') {
  const [currentLang, setCurrentLang] = useState<'es' | 'en'>(forcedLang || 'es')

  useEffect(() => {
    if (!forcedLang && typeof window !== 'undefined') {
      setCurrentLang(getCurrentLang(window.location.pathname))
    }
  }, [forcedLang])

  const translate = (key: string) => {
    return t(key, currentLang)
  }

  return {
    currentLang,
    t: translate
  }
}
