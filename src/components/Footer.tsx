import LogoMark from './LogoMark'

type NavLink = {
  label: string
  href: string
}

const LINKS: NavLink[] = [
  { label: 'Proceso',      href: '#process'      },
  { label: 'Arquitectura', href: '#architecture' },
  { label: 'Diferencial',  href: '#diferencial'  },
  { label: 'Comparativa',  href: '#comparison'   },
  { label: 'Contacto',     href: '#contact'      },
]

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">

        <a href="#" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="text-sm font-semibold text-zinc-500">
            Mole<span className="text-teal-brand">Engineering</span>
          </span>
        </a>

        <nav className="flex flex-wrap justify-center gap-5">
          {LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="text-[12px] text-zinc-400 hover:text-zinc-700 transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <p className="text-[11px] font-mono text-zinc-300">© 2025 Mole Engineering</p>
      </div>
    </footer>
  )
}
