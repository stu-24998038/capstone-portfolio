import { ArrowUpRight } from 'lucide-react';

const ACCENTS = {
  terracotta: {
    bg: 'bg-gradient-to-br from-[#e07652] via-[#cf4f2f] to-[#8f301c]',
    text: 'text-cream',
    line: 'border-white/20',
    panel: 'bg-white/10',
    subtle: 'bg-white/15',
  },
  olive: {
    bg: 'bg-gradient-to-br from-[#89957d] via-[#65745f] to-[#394a35]',
    text: 'text-cream',
    line: 'border-white/20',
    panel: 'bg-white/10',
    subtle: 'bg-white/15',
  },
  ink: {
    bg: 'bg-gradient-to-br from-[#314037] via-[#1b2821] to-[#0d1510]',
    text: 'text-cream',
    line: 'border-white/15',
    panel: 'bg-white/[0.07]',
    subtle: 'bg-white/10',
  },
  sand: {
    bg: 'bg-gradient-to-br from-[#efdfbf] via-[#dcc59b] to-[#b89e6c]',
    text: 'text-ink',
    line: 'border-ink/15',
    panel: 'bg-white/25',
    subtle: 'bg-ink/10',
  },
  clay: {
    bg: 'bg-gradient-to-br from-[#c47a62] via-[#a8533b] to-[#733322]',
    text: 'text-cream',
    line: 'border-white/20',
    panel: 'bg-white/10',
    subtle: 'bg-white/15',
  },
  sky: {
    bg: 'bg-gradient-to-br from-[#a7c1bd] via-[#789894] to-[#4d6a66]',
    text: 'text-cream',
    line: 'border-white/25',
    panel: 'bg-white/15',
    subtle: 'bg-white/20',
  },
};

export default function ProjectArtwork({
  project = {},
  index = 0,
  className = '',
  ratio = 'aspect-[4/3]',
}) {
  const theme = ACCENTS[project.accent] || ACCENTS.terracotta;
  const number = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`relative isolate w-full overflow-hidden rounded-[1.6rem] ${ratio} ${theme.bg} ${theme.text} ${className}`}
      aria-hidden="true"
    >
      {project.imageUrl ? (
        <>
          <img
            src={project.imageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <div className="absolute inset-x-5 top-5 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/80">
            <span>{number}</span>
            <span>{project.year}</span>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-grid opacity-[0.18]" />
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/20" />
          <div className="absolute -right-5 -top-9 h-40 w-40 rounded-full border border-white/15" />
          <div
            className={`absolute -bottom-24 -left-20 h-56 w-56 rounded-full ${theme.subtle} blur-2xl`}
          />

          <div className="absolute inset-x-5 top-5 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.16em] opacity-70">
            <span>{number} / Selected work</span>
            <span>{project.year || '2026'}</span>
          </div>

          <div
            className={`absolute inset-x-6 bottom-0 top-[4.1rem] overflow-hidden rounded-t-[1.1rem] border border-b-0 ${theme.line} ${theme.panel} p-4 shadow-2xl backdrop-blur-[3px] transition-transform duration-700 ease-editorial group-hover:-translate-y-2 sm:inset-x-8 sm:top-20 sm:p-5`}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/55" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
              <span className={`ml-2 h-1 w-16 rounded-full ${theme.subtle}`} />
            </div>

            <div className="mt-5 h-2.5 w-2/3 rounded-full bg-white/55" />
            <div className={`mt-2 h-2 w-2/5 rounded-full ${theme.subtle}`} />

            <div className="mt-5 grid grid-cols-[1.3fr_0.7fr] gap-2.5">
              <div className={`rounded-lg ${theme.panel} p-2.5 ring-1 ${theme.line}`}>
                <div className="flex h-14 items-end gap-1.5 sm:h-16">
                  {[45, 68, 52, 82, 64, 92, 75].map((height, barIndex) => (
                    <span
                      key={barIndex}
                      className={`flex-1 rounded-t-sm ${barIndex === 5 ? 'bg-white/65' : 'bg-white/30'}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className={`flex flex-col justify-between rounded-lg ${theme.panel} p-2.5 ring-1 ${theme.line}`}>
                <span className="h-5 w-5 rounded-full border border-white/40" />
                <div>
                  <div className="h-1.5 w-full rounded-full bg-white/55" />
                  <div className={`mt-1.5 h-1.5 w-2/3 rounded-full ${theme.subtle}`} />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className={`h-1.5 w-20 rounded-full ${theme.subtle}`} />
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/50 text-ink">
                <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
