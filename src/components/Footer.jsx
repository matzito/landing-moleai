const LINKS = [
  { label: 'Capacidades', href: '#capabilities' },
  { label: 'Comparativa', href: '#comparison' },
  { label: 'Proceso',     href: '#process' },
  { label: 'Stack',       href: '#stack' },
  { label: 'Contacto',    href: '#contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">

        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.2"/>
              <rect x="8" y="1" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.2"/>
              <rect x="1" y="8" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.2"/>
              <rect x="8" y="8" width="5" height="5" rx="1" stroke="#0d9488" strokeWidth="1.2" opacity="0.35"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-500">
            Mole<span className="text-teal-brand">AI</span>
          </span>
        </a>

        <nav className="flex flex-wrap justify-center gap-5">
          {LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="text-[12px] text-zinc-400 hover:text-zinc-700 transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <p className="text-[11px] font-mono text-zinc-300">© 2025 MoleAI</p>
      </div>
    </footer>
  )
}
