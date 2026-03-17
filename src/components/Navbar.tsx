import { useState, useEffect } from "react"
import { useRef } from "react"
import { getTools } from "../constants/tools"
import ContactButton from "./ContactButton"
import LanguageSwitcher from "./LanguageSwitcher"
import { getCurrentLang, type Language } from '../utils/i18n'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState<Language>('es')
  const [currentPath, setCurrentPath] = useState("/")
  const [showFloatingNav, setShowFloatingNav] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
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

  useEffect(() => {
    if (!navRef.current) return

    const handleScroll = () => {
      if (!navRef.current) return

      const { bottom } = navRef.current.getBoundingClientRect()
      setShowFloatingNav(bottom < 0)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const homeHref = currentLang === "en" ? "/en/" : "/"
  const isActivePath = (href: string) => currentPath === href

  return (
    <>
    <nav ref={navRef} className='w-full z-40 pt-4'>
      <div className='max-w-[1920px] mx-auto'>
        <div className='surface-nav px-4 h-16 md:h-[72px]'>
        {/* Desktop Layout */}
        <div className='hidden md:grid md:grid-cols-3 md:items-center h-full'>
          {/* Logo a la izquierda */}
          <div className='flex justify-start'>
            <a
              href={homeHref}
              className='font-heading text-2xl font-extrabold text-slate-900 tracking-tight cursor-pointer'
            >
              Hipotecalc
            </a>
          </div>

          {/* Links de navegación en el centro */}
          <div className='flex justify-center'>
            <ul className='flex gap-3 items-center rounded-full border border-slate-200/80 bg-white/50 p-1'>
              {tools
                .filter((tool) => tool.active)
                .map((tool) => (
                  <li key={tool.href}>
                    <a
                      href={tool.href}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${
                        isActivePath(tool.href)
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-700 hover:text-blue-700 hover:bg-white/80"
                      }`}
                    >
                      {tool.label}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Botón de contacto y selector de idioma a la derecha */}
          <div className='flex justify-end items-center gap-4'>
            <LanguageSwitcher />
            <ContactButton variant='desktop' />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className='md:hidden flex items-center justify-between h-full'>
          {/* Logo a la izquierda */}
          <a
            href={homeHref}
            className='font-heading text-xl font-extrabold text-slate-900 tracking-tight cursor-pointer'
          >
            Hipotecalc
          </a>

          {/* Botón de contacto y selector de idioma en el centro */}
          <div className='flex items-center gap-2 ml-auto mr-2'>
            <LanguageSwitcher />
            <ContactButton variant='mobile' />
          </div>

          {/* Botón hamburguesa a la derecha */}
          <button
            onClick={toggleMenu}
            className='btn btn-secondary p-2 text-slate-800 hover:text-blue-700'
            aria-label='Toggle menu'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              )}
            </svg>
          </button>
        </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className='md:hidden mt-2 max-w-[1920px] mx-auto'>
          <div className='surface-nav p-3'>
            <ul className='space-y-1'>
              {tools
                .filter((tool) => tool.active)
                .map((tool) => (
                  <li key={tool.href}>
                    <a
                      href={tool.href}
                      className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition cursor-pointer ${
                        isActivePath(tool.href)
                          ? "bg-blue-600 text-white"
                          : "text-slate-700 hover:text-blue-700 hover:bg-blue-50"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {tool.label}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
    {showFloatingNav && (
      <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xl transition-all duration-300 translate-y-0 opacity-100'>
        <div className='surface-nav px-3 py-2'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-1.5'>
              {tools
                .filter((tool) => tool.active)
                .slice(0, 2)
                .map((tool) => (
                  <a
                    key={`floating-${tool.href}`}
                    href={tool.href}
                    className={`px-3 py-2 rounded-full text-xs font-semibold transition ${
                      isActivePath(tool.href)
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-white/80 hover:text-blue-700"
                    }`}
                  >
                    {tool.label}
                  </a>
                ))}
            </div>
            <ContactButton variant='mobile' />
          </div>
        </div>
      </div>
    )}
    </>
  )
}
