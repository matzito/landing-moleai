import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
  { label: 'Proceso',      href: '#process'      },
  { label: 'Arquitectura', href: '#architecture' },
  { label: 'Diferencial',  href: '#diferencial'  },
  { label: 'Comparativa',  href: '#comparison'   },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? 'bg-white/70 backdrop-blur-md border-b border-zinc-200/50'
          : 'bg-transparent'
      }`}
    >
      <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ease-in-out ${scrolled ? 'h-16' : 'h-20'}`}>

        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-white border border-zinc-200 flex items-center justify-center group-hover:border-zinc-300 transition-colors shadow-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.2"/>
              <rect x="8" y="1" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.2"/>
              <rect x="1" y="8" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.2"/>
              <rect x="8" y="8" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.2" opacity="0.4"/>
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-800">
            Mole<span className="text-teal-brand">AI</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <a href="#contact" className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-[#EC5800] text-white hover:bg-[#d44f00] transition-colors duration-150">
            Agendar Consultoría
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[5px]"
          aria-label="Menu"
        >
          <span className={`block w-5 h-px bg-zinc-600 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`}/>
          <span className={`block w-5 h-px bg-zinc-600 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}/>
          <span className={`block w-5 h-px bg-zinc-600 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}/>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-zinc-200 bg-white shadow-md"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  {label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-[#EC5800] text-white hover:bg-[#d44f00] transition-colors duration-150 mt-1"
              >
                Agendar Consultoría
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}