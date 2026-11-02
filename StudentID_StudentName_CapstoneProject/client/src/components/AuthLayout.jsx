import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Logo from './Logo';

export default function AuthLayout({ children, index = '01' }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden bg-forest p-10 text-cream lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute inset-0 bg-grid opacity-[0.18]" />
          <div
            className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-terracotta/85"
            aria-hidden="true"
          />
          <div
            className="absolute -right-8 top-28 h-40 w-40 rounded-full border border-cream/25"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-cream/10"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between">
            <Logo light />
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-cream/55 transition hover:text-cream"
            >
              Back to site
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="relative max-w-lg py-16">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cream/45">
              Note {index} / The desk
            </p>
            <blockquote className="mt-7 font-display text-[clamp(2.4rem,4vw,3.8rem)] font-light leading-[1.02] tracking-[-0.04em]">
              “Good software feels like a{' '}
              <span className="italic text-[#e9b5a3]">deep breath.</span> I build the whole
              path to get there.”
            </blockquote>
            <p className="mt-8 max-w-sm text-pretty text-sm leading-relaxed text-cream/55">
              The dashboard is where the work behind the portfolio happens — projects,
              journal entries, and the people who write in.
            </p>
          </div>

          <div className="relative flex items-center justify-between border-t border-cream/15 pt-5 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-cream/40">
            <span>Alex Chen / Portfolio 2026</span>
            <span>Singapore · GMT+8</span>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col">
          <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:hidden">
            <Logo />
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted transition hover:text-ink"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
            <div className="w-full max-w-[27rem]">{children}</div>
          </div>

          <div className="flex items-center justify-between px-5 py-5 font-mono text-[0.55rem] uppercase tracking-[0.13em] text-muted/70 sm:px-8">
            <span>© {new Date().getFullYear()} Alex Chen</span>
            <Link to="/" className="transition hover:text-ink">
              alexchen.dev
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
