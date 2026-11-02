import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Logo from './Logo';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NAV = [
  { to: '/projects', label: 'Work' },
  { to: '/blog', label: 'Journal' },
  { to: '/#about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, initializing, logout } = useAuth();
  const { notify } = useToast();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const main = document.getElementById('main');
    if (main) main.inert = true;
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (main) main.inert = false;
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    notify('You have been signed out.', 'info');
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : ''}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? 'border-b border-line/80 bg-paper/90 shadow-[0_12px_40px_-32px_rgba(27,36,31,0.6)] backdrop-blur-xl'
          : 'border-b border-transparent bg-paper/60 backdrop-blur-sm'
      }`}
    >
      <div className="container-editorial flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
        <Logo onClick={() => setOpen(false)} />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {NAV.map((item) =>
            item.to === '/#about' ? (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${
                  pathname === '/' && hash === '#about' ? 'nav-link-active' : ''
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <NavLink key={item.to} to={item.to} className={linkClass} end={false}>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {initializing ? (
            <div className="h-8 w-28 animate-pulse rounded-full bg-line/60" />
          ) : isAuthenticated ? (
            <>
              <Link
                to="/admin"
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.8rem] font-medium transition ${
                  pathname.startsWith('/admin')
                    ? 'bg-ink text-cream'
                    : 'text-ink/75 hover:bg-cream hover:text-ink'
                }`}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <span className="h-5 w-px bg-line" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <Avatar name={user?.username || 'Alex Chen'} size="sm" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-[0.78rem] font-medium text-muted transition hover:text-ink"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3 py-2 text-[0.82rem] font-medium text-ink/70 transition hover:text-ink"
              >
                Log in
              </Link>
              <Link to="/contact" className="btn-primary !px-4 !py-2.5">
                Let’s talk
                <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="icon-btn lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-line bg-paper px-5 pb-10 pt-8 lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {NAV.map((item, index) =>
              item.to === '/#about' ? (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between border-b border-line/70 py-5 font-display text-3xl tracking-[-0.03em] ${
                    pathname === '/' && hash === '#about' ? 'text-terracotta' : 'text-ink'
                  }`}
                >
                  {item.label}
                  <span className="font-mono text-[0.62rem] tracking-widest text-muted">
                    0{index + 1}
                  </span>
                </Link>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between border-b border-line/70 py-5 font-display text-3xl tracking-[-0.03em] ${
                      isActive ? 'text-terracotta' : 'text-ink'
                    }`
                  }
                >
                  {item.label}
                  <span className="font-mono text-[0.62rem] tracking-widest text-muted">
                    0{index + 1}
                  </span>
                </NavLink>
              )
            )}
          </nav>

          <div className="mt-8">
            {initializing ? (
              <div className="h-11 w-full animate-pulse rounded-full bg-line/60" />
            ) : isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-cream p-4">
                  <Avatar name={user?.username} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user?.username}</p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                  </div>
                </div>
                <Link to="/admin" className="btn-primary w-full">
                  <LayoutDashboard size={16} />
                  Open dashboard
                </Link>
                <button type="button" onClick={handleLogout} className="btn-outline w-full">
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" className="btn-outline w-full">
                  Log in
                </Link>
                <Link to="/contact" className="btn-primary w-full">
                  Let’s talk
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
