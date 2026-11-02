import { AlertCircle, Inbox, Loader2, RefreshCw } from 'lucide-react';

export function Spinner({ size = 18, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink font-display text-lg text-cream">
          AC
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
          <Spinner size={16} />
          {label}
        </div>
      </div>
    </div>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[45vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted">
        <Spinner size={18} />
        {label}
      </div>
    </div>
  );
}

export function ErrorState({
  title = 'That didn’t load.',
  message = 'The server may be waking up or the connection may have dropped.',
  onRetry,
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-cream/55 px-6 text-center ${
        compact ? 'py-10' : 'py-16'
      }`}
      role="alert"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
        <AlertCircle size={20} />
      </span>
      <h3 className="mt-4 font-display text-2xl tracking-[-0.02em]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-6">
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet.', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-cream/55 px-6 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/5 text-muted">
        <Inbox size={20} />
      </span>
      <h3 className="mt-4 font-display text-2xl tracking-[-0.02em]">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="skeleton aspect-[4/3] rounded-[1.6rem]" />
      <div className="mt-5 h-3 w-24 rounded bg-line/60" />
      <div className="mt-3 h-7 w-3/4 rounded bg-line/70" />
      <div className="mt-3 h-4 w-full rounded bg-line/50" />
      <div className="mt-2 h-4 w-2/3 rounded bg-line/50" />
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="animate-pulse py-8">
      <div className="h-3 w-28 rounded bg-line/60" />
      <div className="mt-4 h-8 w-4/5 rounded bg-line/70" />
      <div className="mt-3 h-4 w-full rounded bg-line/50" />
      <div className="mt-2 h-4 w-2/3 rounded bg-line/50" />
    </div>
  );
}
