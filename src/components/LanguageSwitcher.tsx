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
      className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-blue-900 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
      aria-label={`Switch to ${currentLang === 'es' ? 'English' : 'Español'}`}
    >
      <span className="text-xs font-bold">
        {currentLang === 'es' ? 'EN' : 'ES'}
      </span>
    </button>
  )
}
