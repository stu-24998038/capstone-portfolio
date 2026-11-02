const THEMES = [
  {
    bg: 'bg-[#d95b39]',
    text: 'text-cream',
    muted: 'text-cream/65',
    line: 'border-cream/25',
  },
  {
    bg: 'bg-[#d8c39b]',
    text: 'text-ink',
    muted: 'text-ink/55',
    line: 'border-ink/20',
  },
  {
    bg: 'bg-[#65745f]',
    text: 'text-cream',
    muted: 'text-cream/60',
    line: 'border-cream/25',
  },
  {
    bg: 'bg-[#243b32]',
    text: 'text-cream',
    muted: 'text-cream/55',
    line: 'border-cream/20',
  },
];

export default function PostArtwork({
  post,
  index = 0,
  className = '',
  ratio = 'aspect-[16/10]',
  detail = false,
}) {
  const theme = THEMES[index % THEMES.length];
  const number = String(index + 1).padStart(2, '0');
  const tag = post.tags?.[0] || 'Field notes';

  return (
    <div
      className={`relative isolate overflow-hidden ${ratio} ${theme.bg} ${theme.text} ${className}`}
      aria-hidden="true"
    >
      {post.coverImage ? (
        <img src={post.coverImage} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <>
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div
            className={`absolute -right-12 -top-12 h-52 w-52 rounded-full border ${theme.line}`}
          />
          <div
            className={`absolute -right-2 top-2 h-32 w-32 rounded-full border ${theme.line}`}
          />
          <div className="absolute inset-x-5 top-5 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] sm:inset-x-7 sm:top-6">
            <span className={theme.muted}>Field note {number}</span>
            <span className={theme.muted}>{tag}</span>
          </div>

          <span
            className={
              detail
                ? 'absolute inset-0 flex select-none items-center justify-center font-display text-[16rem] font-light italic leading-none opacity-[0.1] sm:text-[22rem]'
                : 'absolute -bottom-16 right-0 select-none font-display text-[14rem] font-light italic leading-none opacity-[0.12]'
            }
          >
            {number}
          </span>

          {detail ? (
            <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
              <div className={`h-px w-full ${theme.line} border-t`} />
              <div className={`mt-4 flex items-center justify-between font-mono text-[0.56rem] uppercase tracking-[0.16em] ${theme.muted}`}>
                <span>Alex Chen / Field notes</span>
                <span>{tag}</span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
              <div className={`h-px w-full ${theme.line} border-t`} />
              <p className="mt-4 max-w-lg font-display text-[1.55rem] leading-[1.08] tracking-[-0.03em] sm:text-[2rem]">
                {post.title}
              </p>
            </div>
          )}
        </>
      )}
      {post.coverImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
      )}
    </div>
  );
}
