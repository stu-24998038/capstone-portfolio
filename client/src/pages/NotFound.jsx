import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Compass } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');

  return (
    <section className="relative overflow-hidden pb-24 pt-36 sm:pt-44">
      <div
        className="pointer-events-none absolute -right-20 top-20 h-80 w-80 rounded-full bg-terracotta/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-editorial relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-terracotta" />
              Error 404
            </p>
            <h1 className="mt-6 font-display text-[clamp(5rem,14vw,11rem)] font-light leading-[0.8] tracking-[-0.07em]">
              4<span className="italic text-terracotta">0</span>4
            </h1>
            <h2 className="mt-8 font-display text-3xl tracking-[-0.03em] sm:text-4xl">
              This page wandered off.
            </h2>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted">
              The link may be old, the note may have moved, or the page is still in the
              workshop. The rest of the site is right where you left it.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/" className="btn-primary">
                <ArrowLeft size={15} />
                Back home
              </Link>
              <Link to="/projects" className="btn-outline">
                Browse the work
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-full border border-line" />
            <div className="absolute inset-[12%] rounded-full border border-line" />
            <div className="absolute inset-[24%] rounded-full bg-forest" />
            <div className="absolute inset-[24%] rounded-full bg-grid opacity-20" />
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-cream">
              <Compass size={38} className="text-cream/80" />
              <p className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-cream/55">
                Off the map
              </p>
            </div>
            <span className="absolute left-[12%] top-[20%] flex h-2.5 w-2.5 rounded-full bg-terracotta" />
            <span className="absolute bottom-[16%] right-[20%] flex h-3 w-3 rounded-full border border-ink/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
