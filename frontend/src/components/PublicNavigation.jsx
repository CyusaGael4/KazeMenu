import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import Button from './ui/Button';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/features', label: 'Features' },

  { to: '/faq', label: 'FAQ' },
];

export default function PublicNavigation() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const closeMenu = () => setOpen(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header-inner mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo className="nav-brand" />
        <nav id="main-navigation" className={`main-navigation ${open ? 'main-navigation-open' : ''}`} aria-label="Main navigation">
          <div className="nav-main-links">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="nav-actions">
            <Link to="/login" onClick={closeMenu} className={`nav-link ${pathname === '/login' ? 'nav-link-active' : ''}`}>Log in</Link>
            <Button as={Link} to="/register" onClick={closeMenu} className="nav-cta" aria-current={pathname === '/register' ? 'page' : undefined}>Get Started</Button>
          </div>
        </nav>
        <button
          type="button"
          className="nav-menu-toggle rounded-md p-2 text-black transition-colors hover:bg-soft"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span className={`nav-menu-icon ${open ? 'nav-menu-icon-open' : ''}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>
  );
}
