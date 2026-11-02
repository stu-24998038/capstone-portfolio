import { ArrowUpRight, MapPin } from 'lucide-react';

export default function HeroCard() {
  return (
    <div className="relative mx-auto w-full max-w-[27rem] lg:ml-auto">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-forest text-cream shadow-soft">
        <div className="absolute inset-0 bg-grid opacity-[0.2]" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-terracotta" />
        <div className="absolute -right-8 top-4 h-44 w-44 rounded-full border border-cream/20" />
        <div className="absolute -left-16 bottom-24 h-52 w-52 rounded-full border border-cream/15" />

        <div className="absolute inset-x-7 top-7 flex items-center justify-between font-mono text-[0.58rem] uppercase tracking-[0.18em] text-cream/60">
          <span>Portfolio / 2026</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a9c09a] animate-pulseSoft" />
            Open
          </span>
        </div>

        <div className="absolute inset-x-7 top-[24%]">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-cream/55">
            Designer & developer
          </p>
          <p className="mt-4 font-display text-[5.1rem] font-light italic leading-[0.8] tracking-[-0.06em] sm:text-[5.6rem]">
            Alex
          </p>
          <p className="font-display text-[5.1rem] font-light leading-[0.9] tracking-[-0.06em] sm:text-[5.6rem]">
            Chen<span className="text-terracotta">.</span>
          </p>
        </div>

        <div className="absolute inset-x-7 bottom-7">
          <div className="h-px w-full bg-cream/15" />
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.18em] text-cream/40">
                Based in
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-cream/85">
                <MapPin size={13} />
                Singapore
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.18em] text-cream/40">
                Focus
              </p>
              <p className="mt-1.5 text-sm text-cream/85">Product · Web</p>
            </div>
          </div>
        </div>

        <span className="absolute right-4 top-1/2 hidden -translate-y-1/2 rotate-180 font-mono text-[0.5rem] uppercase tracking-[0.28em] text-cream/35 [writing-mode:vertical-rl] sm:block">
          Calm software · Clear thinking
        </span>
      </div>

      <div className="absolute -bottom-5 -left-4 flex rotate-[-3deg] items-center gap-2 rounded-2xl border border-ink/10 bg-butter px-4 py-3 text-ink shadow-card sm:-left-6">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink/30" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
        </span>
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.13em]">
          Available for select work
        </span>
        <ArrowUpRight size={13} />
      </div>
    </div>
  );
}
