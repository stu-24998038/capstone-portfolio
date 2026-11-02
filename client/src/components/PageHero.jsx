export default function PageHero({ index, label, title, description, children }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-32 sm:pb-16 sm:pt-40">
      <div
        className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-editorial relative">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-terracotta" />
              {index} / {label}
            </p>
            <h1 className="mt-6 max-w-5xl font-display text-[clamp(3.2rem,8vw,7rem)] font-light leading-[0.92] tracking-[-0.045em] text-balance">
              {title}
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-3">
            <p className="max-w-md text-pretty text-[1.02rem] leading-relaxed text-muted">
              {description}
            </p>
            {children && <div className="mt-6">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
