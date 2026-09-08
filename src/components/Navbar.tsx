import { useState, useEffect } from "react"
import { getTools } from "../constants/tools"
import ContactButton from "./ContactButton"
import LanguageSwitcher from "./LanguageSwitcher"
import { getCurrentLang, type Language } from '../utils/i18n'

interface NavbarProps {
  /** Idioma de la página en el HTML estático: evita servir el menú en español
   * en las páginas /en/ antes de la hidratación */
  lang?: Language
  path?: string
}

export default function Navbar({ lang = 'es', path = '/' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState<Language>(lang)
  const [currentPath, setCurrentPath] = useState(path)
  const tools = getTools(currentLang)

  useEffect(() => {
    const syncRouteState = () => {
      const path = window.location.pathname
      setCurrentLang(getCurrentLang(path))
      setCurrentPath(path)
    }

    syncRouteState()
    window.addEventListener("astro:page-load", syncRouteState as EventListener)
    window.addEventListener("popstate", syncRouteState)

    return () => {
      window.removeEventListener("astro:page-load", syncRouteState as EventListener)
      window.removeEventListener("popstate", syncRouteState)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const homeHref = currentLang === "en" ? "/en" : "/"
  const isActivePath = (href: string) => currentPath === href

  return (
    <nav className="w-full sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Desktop */}
        <div className="hidden xl:grid xl:grid-cols-[auto_1fr_auto] xl:items-center xl:gap-3 h-16">
          <div className="flex justify-start">
            <a href={homeHref} className="font-heading text-[22px] font-bold text-ink tracking-tight">
              hipotecalc<span className="text-brand-blue">.</span>
            </a>
          </div>
          <ul className="flex justify-center items-center gap-1">
            {tools.filter((tool) => tool.active && tool.nav !== false).map((tool) => (
              <li key={tool.href}>
                <a
                  href={tool.href}
                  className={`px-3 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition ${
                    isActivePath(tool.href)
                      ? "bg-ink text-white"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {tool.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex justify-end items-center gap-3">
            <LanguageSwitcher />
            <ContactButton variant="desktop" lang={currentLang} />
          </div>
        </div>

        {/* Mobile */}
        <div className="xl:hidden flex items-center justify-between h-14 gap-2">
          <a href={homeHref} className="font-heading text-lg font-bold text-ink tracking-tight">
            hipotecalc<span className="text-brand-blue">.</span>
          </a>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ContactButton variant="mobile" lang={currentLang} />
            <button
              onClick={toggleMenu}
              className="p-2 text-ink"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-nav-menu" className="xl:hidden border-t border-line bg-paper">
          <ul className="max-w-7xl mx-auto px-4 py-2 space-y-1">
            {tools.filter((tool) => tool.active && tool.nav !== false).map((tool) => (
              <li key={tool.href}>
                <a
                  href={tool.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActivePath(tool.href) ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5"
                  }`}
                >
                  {tool.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
