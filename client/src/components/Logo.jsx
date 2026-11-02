import { Link } from 'react-router-dom';

export default function Logo({ light = false, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group inline-flex items-center gap-3"
      aria-label="Alex Chen — home"
    >
      <span
        className={`relative flex h-10 w-10 items-center justify-center rounded-full font-display text-[1.05rem] font-medium transition-transform duration-500 ease-editorial group-hover:-rotate-6 ${
          light ? 'bg-cream text-ink' : 'bg-ink text-cream'
        }`}
        aria-hidden="true"
      >
        AC
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-terracotta" />
      </span>
      <span className="block">
        <span
          className={`block font-display text-[1.05rem] font-medium leading-none tracking-[-0.02em] ${
            light ? 'text-cream' : 'text-ink'
          }`}
        >
          Alex Chen
        </span>
        <span
          className={`mt-1 hidden font-mono text-[0.56rem] uppercase tracking-[0.16em] sm:block ${
            light ? 'text-cream/50' : 'text-muted'
          }`}
        >
          Designer & developer
        </span>
      </span>
    </Link>
  );
}
