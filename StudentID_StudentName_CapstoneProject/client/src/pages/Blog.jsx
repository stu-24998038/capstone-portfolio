import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import PageHero from '../components/PageHero';
import BlogCard from '../components/BlogCard';
import {
  EmptyState,
  ErrorState,
  PostCardSkeleton,
} from '../components/Feedback';
import { api } from '../api/client';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { pluralize } from '../utils/format';

export default function Blog() {
  useDocumentTitle('Journal');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('All');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.blog.list();
        if (!cancelled) setPosts(data || []);
      } catch (requestError) {
        if (!cancelled) setError(requestError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const tags = useMemo(() => {
    const unique = new Set();
    posts.forEach((post) => (post.tags || []).forEach((item) => unique.add(item)));
    return ['All', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [posts]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesTag = tag === 'All' || (post.tags || []).includes(tag);
      const matchesQuery =
        !normalized ||
        [post.title, post.excerpt, post.content, ...(post.tags || [])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalized));
      return matchesTag && matchesQuery;
    });
  }, [posts, query, tag]);

  const showFeatured = !query.trim() && tag === 'All' && filtered.length > 0;
  const featured = showFeatured ? filtered[0] : null;
  const remainder = showFeatured ? filtered.slice(1) : filtered;

  return (
    <>
      <PageHero
        index="02"
        label="Journal"
        title={
          <>
            Field notes from
            <span className="block italic text-terracotta">the workshop.</span>
          </>
        }
        description="Occasional writing about product decisions, the craft of front-end work, and the things I learn by shipping. No growth hacks — just notes from the desk."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip">{pluralize(posts.length, 'note')}</span>
          <span className="chip">Design · Code · Process</span>
        </div>
      </PageHero>

      <section className="pb-24">
        <div className="container-editorial">
          <div className="flex flex-col gap-5 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full max-w-md">
              <span className="sr-only">Search journal</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notes…"
                className="input !rounded-full !py-2.5 !pl-10 !pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
              {tags.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTag(item)}
                  className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] transition ${
                    tag === item
                      ? 'border-ink bg-ink text-cream'
                      : 'border-line bg-cream/50 text-muted hover:border-ink/40 hover:text-ink'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="space-y-10">
                <div className="grid animate-pulse gap-8 lg:grid-cols-12">
                  <div className="skeleton aspect-[16/10] rounded-[1.6rem] lg:col-span-7" />
                  <div className="space-y-4 py-6 lg:col-span-5">
                    <div className="h-4 w-24 rounded bg-line/60" />
                    <div className="h-10 w-full rounded bg-line/70" />
                    <div className="h-10 w-2/3 rounded bg-line/70" />
                    <div className="h-4 w-full rounded bg-line/50" />
                    <div className="h-4 w-3/4 rounded bg-line/50" />
                  </div>
                </div>
                <div className="grid gap-x-12 md:grid-cols-2">
                  {[0, 1, 2, 3].map((item) => (
                    <PostCardSkeleton key={item} />
                  ))}
                </div>
              </div>
            ) : error ? (
              <ErrorState
                title="The journal is out of reach."
                message={error.message}
                onRetry={() => setReloadKey((key) => key + 1)}
              />
            ) : filtered.length ? (
              <>
                {featured && (
                  <div className="mb-14">
                    <BlogCard post={featured} index={0} featured />
                  </div>
                )}
                <div className={`grid gap-x-12 ${featured ? 'md:grid-cols-2' : 'md:grid-cols-2'}`}>
                  {remainder.map((post, index) => (
                    <BlogCard
                      key={post._id}
                      post={post}
                      index={featured ? index + 1 : index}
                    />
                  ))}
                </div>
                <p className="mt-10 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                  Showing {filtered.length} of {posts.length} notes
                </p>
              </>
            ) : (
              <EmptyState
                title="No notes found."
                message="Try a different phrase or clear the filters to see everything."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setTag('All');
                    }}
                    className="btn-outline"
                  >
                    Clear search
                  </button>
                }
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
