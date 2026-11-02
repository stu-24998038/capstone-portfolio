import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  Link2,
  MessageCircle,
  Send,
  Share2,
} from 'lucide-react';
import PostArtwork from '../components/PostArtwork';
import Avatar from '../components/Avatar';
import { ErrorState, PageLoader, Spinner } from '../components/Feedback';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  firstError,
  formatDate,
  readingTime,
  timeAgo,
} from '../utils/format';

export default function BlogDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { token, user, isAuthenticated } = useAuth();
  const { notify } = useToast();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle(post?.title || 'Journal');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.blog.get(id);
        if (cancelled) return;
        setPost(data);
        setComments(data.comments || []);
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
  }, [id, reloadKey]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify('Link copied to your clipboard.', 'success');
    } catch {
      notify('Could not copy the link. You can copy it from the address bar.', 'error');
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    const trimmed = commentBody.trim();
    if (trimmed.length < 2) {
      setCommentError('Write a little more before posting.');
      return;
    }

    setSubmitting(true);
    setCommentError('');
    try {
      const created = await api.comments.create(id, { body: trimmed }, token);
      setComments((current) => [...current, created]);
      setCommentBody('');
      notify('Your comment is live.', 'success');
    } catch (requestError) {
      if (requestError.status === 401) {
        notify('Your session expired. Sign in again to comment.', 'error');
      } else {
        setCommentError(firstError(requestError));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Opening the note…" />;

  if (error) {
    return (
      <section className="pb-24 pt-36">
        <div className="container-editorial">
          <Link
            to="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
          >
            <ArrowLeft size={15} />
            Back to journal
          </Link>
          <ErrorState
            title={error.status === 404 ? 'This note isn’t here.' : 'The note didn’t load.'}
            message={
              error.status === 404
                ? 'It may have been unpublished or the link may be wrong. The rest of the journal is still open.'
                : error.message
            }
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        </div>
      </section>
    );
  }

  const tags = post.tags || [];

  return (
    <article>
      <header className="pb-10 pt-32 sm:pt-36">
        <div className="container-editorial">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
          >
            <ArrowLeft size={15} />
            All notes
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
              <span className="ml-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
                {formatDate(post.createdAt, { short: true })}
              </span>
            </div>

            <h1 className="mt-6 text-balance font-display text-[clamp(2.9rem,6.5vw,5.8rem)] font-light leading-[0.94] tracking-[-0.045em]">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-6 max-w-2xl text-pretty text-[1.08rem] leading-relaxed text-muted sm:text-[1.18rem]">
                {post.excerpt}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-5">
              <div className="flex items-center gap-2.5">
                <Avatar name={post.author?.username || 'Alex Chen'} size="sm" />
                <span className="text-sm font-medium">
                  {post.author?.username || 'Alex Chen'}
                </span>
              </div>
              <span className="hidden h-1 w-1 rounded-full bg-line sm:block" />
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <Clock3 size={13} />
                {readingTime(post)}
              </span>
              <button
                type="button"
                onClick={copyLink}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-xs font-medium transition hover:border-ink hover:bg-cream"
              >
                <Share2 size={13} />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-editorial">
        <PostArtwork
          post={post}
          index={0}
          detail
          ratio="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
          className="rounded-[1.8rem] shadow-soft"
        />
      </div>

      <div className="container-editorial section-pad">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <div className="prose-editorial max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node: _node, ...props }) => (
                    <a {...props} target="_blank" rel="noreferrer" />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <section id="comments" className="mt-16 border-t border-line pt-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Conversation</p>
                  <h2 className="mt-2 flex items-center gap-2 font-display text-3xl tracking-[-0.03em]">
                    {comments.length} {comments.length === 1 ? 'response' : 'responses'}
                    <MessageCircle size={20} className="text-muted" />
                  </h2>
                </div>
              </div>

              {isAuthenticated ? (
                <form onSubmit={submitComment} className="mt-7 rounded-[1.5rem] border border-line bg-cream/60 p-5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user?.username} size="sm" />
                    <p className="text-sm">
                      Joining as <span className="font-medium">{user?.username}</span>
                    </p>
                  </div>
                  <label htmlFor="comment-body" className="sr-only">
                    Your comment
                  </label>
                  <textarea
                    id="comment-body"
                    value={commentBody}
                    onChange={(event) => {
                      setCommentBody(event.target.value);
                      if (commentError) setCommentError('');
                    }}
                    rows={4}
                    maxLength={1000}
                    placeholder="Add to the conversation…"
                    className={`input mt-4 resize-y ${commentError ? 'input-error' : ''}`}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
                      {commentBody.length} / 1000
                    </span>
                    <div className="flex items-center gap-3">
                      {commentError && (
                        <p className="text-xs font-medium text-red-700">{commentError}</p>
                      )}
                      <button type="submit" className="btn-primary !py-2.5" disabled={submitting}>
                        {submitting ? <Spinner size={15} /> : <Send size={15} />}
                        {submitting ? 'Posting…' : 'Post comment'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-[1.5rem] border border-dashed border-line bg-cream/50 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink">
                      <MessageCircle size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">Want to join the conversation?</p>
                      <p className="text-xs text-muted">Sign in to leave a response.</p>
                    </div>
                  </div>
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="btn-outline shrink-0 !py-2.5"
                  >
                    Sign in
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}

              <div className="mt-8">
                {comments.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-line px-5 py-8 text-center text-sm text-muted">
                    No responses yet. Be the first to add a thought.
                  </p>
                ) : (
                  <ul className="space-y-6">
                    {comments.map((comment) => (
                      <li key={comment._id} className="flex gap-3.5">
                        <Avatar
                          name={comment.author?.username || 'Reader'}
                          size="md"
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1 rounded-2xl border border-line bg-cream/45 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium">
                              {comment.author?.username || 'Reader'}
                            </p>
                            <time
                              dateTime={comment.createdAt}
                              className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-muted"
                            >
                              {timeAgo(comment.createdAt)}
                            </time>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">
                            {comment.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-5">
              <div className="rounded-[1.6rem] border border-line bg-cream/65 p-6">
                <p className="eyebrow">Written by</p>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar name={post.author?.username || 'Alex Chen'} size="lg" />
                  <div>
                    <p className="font-display text-xl tracking-[-0.02em]">Alex Chen</p>
                    <p className="text-xs text-muted">Designer & developer</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Notes on building calm, useful software — and the occasional detour into
                  typography, coffee, and long walks.
                </p>
                <Link
                  to="/contact"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-terracotta"
                >
                  Get in touch
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              {tags.length > 0 && (
                <div className="rounded-[1.6rem] border border-line bg-cream/65 p-6">
                  <p className="eyebrow">Filed under</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link key={tag} to="/blog" className="chip hover:border-ink hover:text-ink">
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={copyLink}
                className="flex w-full items-center justify-between rounded-[1.6rem] border border-line bg-cream/65 p-6 text-left transition hover:border-ink"
              >
                <div>
                  <p className="eyebrow">Pass it on</p>
                  <p className="mt-2 font-display text-xl tracking-[-0.02em]">
                    Copy the link
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line">
                  <Link2 size={15} />
                </span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
