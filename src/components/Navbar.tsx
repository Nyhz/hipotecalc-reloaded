import { useState } from "react"
import { tools } from "../constants/tools"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className='w-full bg-white shadow-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 h-16'>
        {/* Desktop Layout */}
        <div className='hidden md:grid md:grid-cols-3 md:items-center h-full'>
          {/* Logo a la izquierda */}
          <div className='flex justify-start'>
            <a
              href='/'
              className='text-2xl font-bold text-blue-900 tracking-tight cursor-pointer'
            >
              Hipotecalc
            </a>
          </div>

          {/* Links de navegación en el centro */}
          <div className='flex justify-center'>
            <ul className='flex gap-6 items-center'>
              {tools
                .filter((tool) => tool.active)
                .map((tool) => (
                  <li key={tool.href}>
                    <a
                      href={tool.href}
                      className='text-blue-900 font-medium hover:text-blue-600 transition cursor-pointer'
                    >
                      {tool.label}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Botón de contacto a la derecha */}
          <div className='flex justify-end'>
            <a
              href='/contacto'
              className='relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 font-medium hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-blue-200/30 before:to-transparent before:translate-x-[-100%] before:animate-[shimmer_3s_ease-in-out_infinite] hover:before:animate-none'
              style={{
                animationDelay: "0s",
              }}
            >
              Contacta con nuestro broker
            </a>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className='md:hidden flex items-center justify-between h-full'>
          {/* Logo a la izquierda */}
          <a
            href='/'
            className='text-xl font-bold text-blue-900 tracking-tight cursor-pointer'
          >
            Hipotecalc
          </a>

          {/* Botón de contacto en el centro */}
          <a
            href='/contacto'
            className='relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 font-medium hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-sm transform hover:-translate-y-0.5 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-blue-200/30 before:to-transparent before:translate-x-[-100%] before:animate-[shimmer_3s_ease-in-out_infinite] hover:before:animate-none'
            style={{
              animationDelay: "0s",
            }}
          >
            Contactar
          </a>

          {/* Botón hamburguesa a la derecha */}
          <button
            onClick={toggleMenu}
            className='text-blue-900 hover:text-blue-600 transition-colors p-2'
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

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-white border-t border-gray-200 shadow-sm'>
          <div className='max-w-7xl mx-auto px-4 py-2'>
            <ul className='space-y-2'>
              {tools
                .filter((tool) => tool.active)
                .map((tool) => (
                  <li key={tool.href}>
                    <a
                      href={tool.href}
                      className='block text-blue-900 font-medium hover:text-blue-600 transition cursor-pointer py-2'
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
  )
}
