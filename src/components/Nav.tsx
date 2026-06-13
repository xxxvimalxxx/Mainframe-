import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/console', label: 'Mainframe Commands' },
    { to: '/batch', label: 'Batch operations tools' },
    { to: '/youtube', label: 'Youtube repository' },
    { to: '/ipl', label: 'IPL concept' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
        <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff">
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
        <span className="text-white text-lg sm:text-2xl font-playfair italic">Mainframe knowledge database</span>
      </Link>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <button
        onClick={() => setMenuOpen(o => !o)}
        className="md:hidden text-white p-1"
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {menuOpen && (
        <div className="fixed top-[60px] left-4 right-4 md:hidden z-[100] bg-zinc-900/95 backdrop-blur-md border border-white/20 rounded-2xl py-3 px-2 flex flex-col gap-1 shadow-2xl">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-colors px-4 py-3 rounded-xl text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
