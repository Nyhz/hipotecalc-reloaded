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
      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 bg-white rounded-full hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition-colors"
      aria-label={`Switch to ${currentLang === 'es' ? 'English' : 'Español'}`}
    >
      <span className="text-[11px] font-bold tracking-wide">
        {currentLang === 'es' ? 'EN' : 'ES'}
      </span>
    </button>
  )
}
