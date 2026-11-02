import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PostArtwork from './PostArtwork';
import { clampText, formatDate, readingTime } from '../utils/format';

export default function BlogCard({ post, index = 0, featured = false }) {
  if (featured) {
    return (
      <article className="group">
        <Link
          to={`/blog/${post._id}`}
          className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-10"
        >
          <div className="overflow-hidden rounded-[1.6rem] lg:col-span-7">
            <PostArtwork post={post} index={index} className="transition-transform duration-700 ease-editorial group-hover:scale-[1.015]" />
          </div>
          <div className="flex flex-col justify-center py-2 lg:col-span-5 lg:py-6">
            <div className="flex flex-wrap items-center gap-3">
              {(post.tags || []).slice(0, 2).map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
                {readingTime(post)}
              </span>
            </div>
            <h2 className="mt-5 font-display text-[clamp(2rem,3.2vw,3rem)] font-light leading-[1.02] tracking-[-0.035em] transition-colors duration-300 group-hover:text-terracotta">
              {post.title}
            </h2>
            <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-muted">
              {clampText(post.excerpt || post.content, 185)}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
                {formatDate(post.createdAt, { short: true })}
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                Read the note
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group border-b border-line first:border-t">
      <Link
        to={`/blog/${post._id}`}
        className="grid gap-4 py-7 sm:grid-cols-[9.5rem_1fr_auto] sm:items-start sm:gap-8"
      >
        <div className="flex items-center gap-3 sm:block">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
            {formatDate(post.createdAt, { short: true })}
          </p>
          <p className="mt-0 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted/70 sm:mt-1.5">
            {readingTime(post)}
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {(post.tags || []).slice(0, 2).map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mt-3 max-w-2xl font-display text-[1.65rem] leading-[1.15] tracking-[-0.025em] transition-colors duration-300 group-hover:text-terracotta sm:text-[2rem]">
            {post.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {clampText(post.excerpt || post.content, 140)}
          </p>
        </div>

        <span className="hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-cream/50 transition duration-300 group-hover:-translate-y-1 group-hover:border-ink group-hover:bg-ink group-hover:text-cream sm:flex">
          <ArrowUpRight size={17} />
        </span>
      </Link>
    </article>
  );
}
