import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import Logo from './Logo';

const LINKS = [
  { to: '/projects', label: 'Work' },
  { to: '/blog', label: 'Journal' },
  { to: '/#about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-forest text-cream">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.22]" />
      <div
        className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-terracotta/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-editorial relative">
        <div className="grid gap-12 border-b border-cream/15 py-16 sm:py-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <p className="eyebrow-dark">Have something in mind?</p>
            <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.8rem,6vw,5.2rem)] font-light leading-[0.98] tracking-[-0.04em]">
              Let’s make something{' '}
              <span className="italic text-[#e9b5a3]">worth keeping.</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/contact" className="btn-light">
                Start a conversation
                <ArrowUpRight size={16} />
              </Link>
              <a href="mailto:hello@alexchen.dev" className="btn-ghost-light">
                <Mail size={16} />
                hello@alexchen.dev
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-4 lg:pl-10">
            <div>
              <p className="eyebrow-dark">Explore</p>
              <ul className="mt-5 space-y-3">
                {LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-cream/70 transition hover:text-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow-dark">Elsewhere</p>
              <ul className="mt-5 space-y-3">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-cream/70 transition hover:text-cream"
                  >
                    <Github size={14} />
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-cream/70 transition hover:text-cream"
                  >
                    <Linkedin size={14} />
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@alexchen.dev"
                    className="inline-flex items-center gap-2 text-sm text-cream/70 transition hover:text-cream"
                  >
                    <Mail size={14} />
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Logo light />
          <p className="max-w-md text-xs leading-relaxed text-cream/45">
            Designed and built with care — React, Express, MongoDB. This site is a living
            portfolio, so the work and the words keep changing.
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cream/40">
            © {year} Alex Chen
          </p>
        </div>
      </div>
    </footer>
  );
}
