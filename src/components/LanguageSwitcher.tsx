import { useState, useEffect } from 'react'
import { getCurrentLang, getAlternatePath, type Language } from '../utils/i18n'

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>('es')

  useEffect(() => {
    setCurrentLang(getCurrentLang(window.location.pathname))
  }, [])

  const toggleLanguage = () => {
    const alternatePath = getAlternatePath(window.location.pathname)
    window.location.href = alternatePath
  }

  return (
    <button
      onClick={toggleLanguage}
      className="btn-outline px-2.5 py-1.5 text-xs cursor-pointer"
      aria-label={`Switch to ${currentLang === 'es' ? 'English' : 'Español'}`}
    >
      <span className="text-[11px] font-bold tracking-wide">
        {currentLang === 'es' ? 'EN' : 'ES'}
      </span>
    </button>
  )
}
