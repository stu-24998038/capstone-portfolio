import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  FolderKanban,
  Inbox,
  Mail,
  MailOpen,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectFormModal from '../components/admin/ProjectFormModal';
import PostFormModal from '../components/admin/PostFormModal';
import { EmptyState, ErrorState } from '../components/Feedback';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { firstError, formatDate, timeAgo } from '../utils/format';

const ACCENT_BG = {
  terracotta: 'bg-[#d95b39]',
  olive: 'bg-[#65745f]',
  ink: 'bg-[#1b241f]',
  sand: 'bg-[#d8c39b]',
  clay: 'bg-[#a8533b]',
  sky: 'bg-[#789894]',
};

const TABS = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'posts', label: 'Journal', icon: NotebookPen },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
];

function AdminSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-64 rounded bg-line/70" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-36 rounded-3xl bg-line/40" />
        ))}
      </div>
      <div className="h-[26rem] rounded-3xl bg-line/30" />
    </div>
  );
}

export default function Admin() {
  useDocumentTitle('Dashboard');

  const { user, token, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [projectModal, setProjectModal] = useState({ open: false, project: null });
  const [postModal, setPostModal] = useState({ open: false, post: null });
  const [confirm, setConfirm] = useState(null);
  const [busyMessageId, setBusyMessageId] = useState(null);

  const handleAuthFailure = useCallback(
    (error) => {
      if (error?.status !== 401) return false;
      logout();
      notify('Your session expired. Please sign in again.', 'error');
      navigate('/login', { replace: true });
      return true;
    },
    [logout, navigate, notify]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [projectData, postData, messageData] = await Promise.all([
          api.projects.list(),
          api.blog.list(),
          api.contact.list(token),
        ]);
        if (cancelled) return;
        setProjects(projectData || []);
        setPosts(postData || []);
        setMessages(messageData || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthFailure(error)) setLoadError(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (token) load();
    return () => {
      cancelled = true;
    };
  }, [token, handleAuthFailure, reloadKey]);

  const unread = messages.filter((message) => !message.read).length;

  const handleProjectSaved = (saved, mode) => {
    setProjects((current) =>
      mode === 'created'
        ? [saved, ...current]
        : current.map((project) => (project._id === saved._id ? saved : project))
    );
    setProjectModal({ open: false, project: null });
    notify(mode === 'created' ? 'Project created.' : 'Project updated.', 'success');
    setTab('projects');
  };

  const handlePostSaved = (saved, mode) => {
    setPosts((current) =>
      mode === 'created'
        ? [saved, ...current]
        : current.map((post) => (post._id === saved._id ? saved : post))
    );
    setPostModal({ open: false, post: null });
    notify(mode === 'created' ? 'Journal note published.' : 'Journal note updated.', 'success');
    setTab('posts');
  };

  const deleteProject = (project) => {
    setConfirm({
      title: 'Delete this project?',
      description: `“${project.title}” will be removed from the portfolio immediately.`,
      confirmLabel: 'Delete project',
      onConfirm: async () => {
        try {
          await api.projects.remove(project._id, token);
          setProjects((current) => current.filter((item) => item._id !== project._id));
          notify('Project deleted.', 'success');
        } catch (error) {
          if (handleAuthFailure(error)) return;
          notify(firstError(error), 'error');
          throw error;
        }
      },
    });
  };

  const deletePost = (post) => {
    setConfirm({
      title: 'Delete this journal note?',
      description: `“${post.title}” and all of its comments will be removed.`,
      confirmLabel: 'Delete note',
      onConfirm: async () => {
        try {
          await api.blog.remove(post._id, token);
          setPosts((current) => current.filter((item) => item._id !== post._id));
          notify('Journal note deleted.', 'success');
        } catch (error) {
          if (handleAuthFailure(error)) return;
          notify(firstError(error), 'error');
          throw error;
        }
      },
    });
  };

  const deleteMessage = (message) => {
    setConfirm({
      title: 'Delete this message?',
      description: `The message from ${message.name} will be permanently removed.`,
      confirmLabel: 'Delete message',
      onConfirm: async () => {
        try {
          await api.contact.remove(message._id, token);
          setMessages((current) => current.filter((item) => item._id !== message._id));
          notify('Message deleted.', 'success');
        } catch (error) {
          if (handleAuthFailure(error)) return;
          notify(firstError(error), 'error');
          throw error;
        }
      },
    });
  };

  const toggleMessageRead = async (message) => {
    setBusyMessageId(message._id);
    try {
      const updated = await api.contact.markRead(message._id, !message.read, token);
      setMessages((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch (error) {
      if (!handleAuthFailure(error)) notify(firstError(error), 'error');
    } finally {
      setBusyMessageId(null);
    }
  };

  const handleLogout = () => {
    logout();
    notify('You have been signed out.', 'info');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[92rem] items-center gap-4 px-5 sm:px-8 lg:px-10">
          <Logo />
          <span className="hidden rounded-full border border-line bg-cream px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-muted sm:inline-flex">
            Admin
          </span>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted transition hover:bg-cream hover:text-ink sm:text-sm"
            >
              View site
              <ArrowUpRight size={14} />
            </Link>
            <span className="hidden h-5 w-px bg-line sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={user?.username || 'Alex Chen'} size="sm" />
              <span className="max-w-[7rem] truncate text-sm font-medium">{user?.username}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-medium text-muted transition hover:border-ink hover:text-ink sm:text-sm"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[92rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        {loading ? (
          <AdminSkeleton />
        ) : loadError ? (
          <div className="py-10">
            <ErrorState
              title="The dashboard didn’t load."
              message={loadError.message}
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col justify-between gap-6 border-b border-line pb-8 lg:flex-row lg:items-end">
              <div>
                <p className="eyebrow flex items-center gap-3">
                  <span className="h-px w-8 bg-terracotta" />
                  Dashboard / Private
                </p>
                <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.2rem)] font-light leading-[0.98] tracking-[-0.04em]">
                  Good to see you,{' '}
                  <span className="italic text-terracotta">{user?.username}.</span>
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                  The work, the writing, and the people who wrote in — all in one quiet room.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setProjectModal({ open: true, project: null })}
                  className="btn-primary"
                >
                  <Plus size={15} />
                  New project
                </button>
                <button
                  type="button"
                  onClick={() => setPostModal({ open: true, post: null })}
                  className="btn-outline"
                >
                  <Pencil size={15} />
                  Write a note
                </button>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: 'Projects',
                  value: projects.length,
                  note: `${projects.filter((project) => project.featured).length} featured`,
                  icon: FolderKanban,
                  accent: 'text-terracotta bg-terracotta/10',
                },
                {
                  label: 'Journal notes',
                  value: posts.length,
                  note: `${posts.filter((post) => post.featured).length} featured`,
                  icon: NotebookPen,
                  accent: 'text-forest bg-forest/10',
                },
                {
                  label: 'Unread messages',
                  value: unread,
                  note: `${messages.length} total in inbox`,
                  icon: Inbox,
                  accent: 'text-[#8a6c2f] bg-butter/30',
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-start justify-between rounded-[1.5rem] border border-line bg-cream/65 p-5 sm:p-6"
                  >
                    <div>
                      <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-muted">
                        {stat.label}
                      </p>
                      <p className="mt-2 font-display text-4xl tracking-[-0.03em]">{stat.value}</p>
                      <p className="mt-1 text-xs text-muted">{stat.note}</p>
                    </div>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.accent}`}>
                      <Icon size={18} />
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-line pb-4">
              {TABS.map((item) => {
                const Icon = item.icon;
                const count =
                  item.id === 'projects'
                    ? projects.length
                    : item.id === 'posts'
                      ? posts.length
                      : unread;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`admin-tab ${tab === item.id ? 'admin-tab-active' : ''}`}
                  >
                    <Icon size={15} />
                    {item.label}
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.5 font-mono text-[0.55rem] ${
                        tab === item.id ? 'bg-cream/15 text-cream/80' : 'bg-ink/5 text-muted'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              {tab === 'projects' && (
                <section className="overflow-hidden rounded-[1.6rem] border border-line bg-cream/40">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
                    <div>
                      <p className="eyebrow">Portfolio</p>
                      <h2 className="mt-1 font-display text-2xl tracking-[-0.02em]">
                        Your projects
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProjectModal({ open: true, project: null })}
                      className="btn-primary !py-2.5"
                    >
                      <Plus size={15} />
                      Add project
                    </button>
                  </div>

                  {projects.length === 0 ? (
                    <div className="p-6">
                      <EmptyState
                        title="No projects yet."
                        message="Add the first case study to bring the portfolio to life."
                        action={
                          <button
                            type="button"
                            onClick={() => setProjectModal({ open: true, project: null })}
                            className="btn-primary"
                          >
                            <Plus size={15} />
                            Add a project
                          </button>
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="hidden grid-cols-[1fr_10rem_7rem_6rem] gap-4 border-b border-line px-6 py-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-muted md:grid">
                        <span>Project</span>
                        <span>Toolkit</span>
                        <span>Status</span>
                        <span className="text-right">Actions</span>
                      </div>
                      <div className="divide-y divide-line">
                        {projects.map((project) => (
                          <div
                            key={project._id}
                            className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-cream/75 sm:px-6 md:grid-cols-[1fr_10rem_7rem_6rem]"
                          >
                            <div className="flex min-w-0 items-center gap-3.5">
                              <span
                                className={`flex h-12 w-14 shrink-0 items-center justify-center rounded-xl font-display text-lg text-cream ${
                                  ACCENT_BG[project.accent] || ACCENT_BG.terracotta
                                }`}
                              >
                                {project.title?.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{project.title}</p>
                                <p className="mt-0.5 truncate font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">
                                  {project.year || '—'} · {formatDate(project.createdAt, { short: true })}
                                </p>
                              </div>
                            </div>

                            <div className="hidden flex-wrap gap-1.5 md:flex">
                              {(project.techStack || []).slice(0, 2).map((tech) => (
                                <span key={tech} className="chip !text-[0.52rem]">
                                  {tech}
                                </span>
                              ))}
                              {(project.techStack || []).length > 2 && (
                                <span className="chip !text-[0.52rem]">
                                  +{project.techStack.length - 2}
                                </span>
                              )}
                            </div>

                            <div className="hidden md:block">
                              {project.featured ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-terracotta/10 px-2 py-1 text-[0.58rem] font-medium text-clay">
                                  <Check size={11} />
                                  Featured
                                </span>
                              ) : (
                                <span className="text-[0.62rem] text-muted">Live</span>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/projects/${project._id}`}
                                className="icon-btn"
                                aria-label={`View ${project.title}`}
                                title="View on site"
                              >
                                <ArrowUpRight size={15} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setProjectModal({ open: true, project })}
                                className="icon-btn"
                                aria-label={`Edit ${project.title}`}
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProject(project)}
                                className="icon-btn-danger"
                                aria-label={`Delete ${project.title}`}
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {tab === 'posts' && (
                <section className="overflow-hidden rounded-[1.6rem] border border-line bg-cream/40">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
                    <div>
                      <p className="eyebrow">Journal</p>
                      <h2 className="mt-1 font-display text-2xl tracking-[-0.02em]">
                        Published notes
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPostModal({ open: true, post: null })}
                      className="btn-primary !py-2.5"
                    >
                      <Plus size={15} />
                      Write a note
                    </button>
                  </div>

                  {posts.length === 0 ? (
                    <div className="p-6">
                      <EmptyState
                        title="The journal is empty."
                        message="Write the first note — a process thought, a project retrospective, anything useful."
                        action={
                          <button
                            type="button"
                            onClick={() => setPostModal({ open: true, post: null })}
                            className="btn-primary"
                          >
                            <Pencil size={15} />
                            Write a note
                          </button>
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="hidden grid-cols-[1fr_8rem_7rem_6rem] gap-4 border-b border-line px-6 py-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-muted md:grid">
                        <span>Note</span>
                        <span>Tags</span>
                        <span>Published</span>
                        <span className="text-right">Actions</span>
                      </div>
                      <div className="divide-y divide-line">
                        {posts.map((post) => (
                          <div
                            key={post._id}
                            className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-cream/75 sm:px-6 md:grid-cols-[1fr_8rem_7rem_6rem]"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {post.featured && (
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                                )}
                                <p className="truncate font-medium">{post.title}</p>
                              </div>
                              <p className="mt-0.5 truncate text-xs text-muted">
                                {post.excerpt || 'No excerpt yet.'}
                              </p>
                            </div>

                            <div className="hidden flex-wrap gap-1.5 md:flex">
                              {(post.tags || []).slice(0, 2).map((tag) => (
                                <span key={tag} className="chip !text-[0.52rem]">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="hidden md:block">
                              <p className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
                                {formatDate(post.createdAt, { short: true })}
                              </p>
                              <p className="mt-1 text-[0.62rem] text-muted">
                                {post.readTime || 1} min read
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/blog/${post._id}`}
                                className="icon-btn"
                                aria-label={`View ${post.title}`}
                                title="View on site"
                              >
                                <ArrowUpRight size={15} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setPostModal({ open: true, post })}
                                className="icon-btn"
                                aria-label={`Edit ${post.title}`}
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePost(post)}
                                className="icon-btn-danger"
                                aria-label={`Delete ${post.title}`}
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {tab === 'inbox' && (
                <section className="overflow-hidden rounded-[1.6rem] border border-line bg-cream/40">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
                    <div>
                      <p className="eyebrow">Inbox</p>
                      <h2 className="mt-1 font-display text-2xl tracking-[-0.02em]">
                        Messages from the site
                      </h2>
                    </div>
                    <span className="chip">{unread} unread</span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="p-6">
                      <EmptyState
                        title="The inbox is quiet."
                        message="Messages sent through the contact form will appear here."
                      />
                    </div>
                  ) : (
                    <div className="divide-y divide-line">
                      {messages.map((message) => (
                        <article
                          key={message._id}
                          className={`px-4 py-5 transition sm:px-6 ${
                            message.read ? 'bg-transparent' : 'bg-butter/[0.12]'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[0.62rem] uppercase text-cream">
                                {message.name
                                  ?.split(/\s+/)
                                  .map((part) => part[0])
                                  .join('')
                                  .slice(0, 2)}
                                {!message.read && (
                                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-terracotta" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium">{message.name}</p>
                                  {!message.read && (
                                    <span className="rounded-full bg-terracotta/10 px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-clay">
                                      New
                                    </span>
                                  )}
                                </div>
                                <a
                                  href={`mailto:${message.email}`}
                                  className="mt-0.5 block truncate text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink"
                                >
                                  {message.email}
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <time className="mr-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] text-muted">
                                {timeAgo(message.createdAt)}
                              </time>
                              <button
                                type="button"
                                onClick={() => toggleMessageRead(message)}
                                disabled={busyMessageId === message._id}
                                className="icon-btn"
                                aria-label={message.read ? 'Mark as unread' : 'Mark as read'}
                                title={message.read ? 'Mark as unread' : 'Mark as read'}
                              >
                                {message.read ? <Mail size={15} /> : <MailOpen size={15} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMessage(message)}
                                className="icon-btn-danger"
                                aria-label={`Delete message from ${message.name}`}
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap pl-0 text-sm leading-relaxed text-ink/75 sm:pl-[3.25rem]">
                            {message.message}
                          </p>

                          <div className="mt-3 sm:pl-[3.25rem]">
                            <a
                              href={`mailto:${message.email}?subject=${encodeURIComponent(
                                'Re: your note via alexchen.dev'
                              )}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-terracotta transition hover:text-clay"
                            >
                              Reply by email
                              <ArrowUpRight size={12} />
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line py-6 text-[0.65rem] text-muted sm:flex-row sm:items-center">
              <p>
                Signed in as <span className="font-medium text-ink">{user?.email}</span>
              </p>
              <p className="font-mono uppercase tracking-[0.12em]">
                Folio admin · {new Date().getFullYear()}
              </p>
            </div>
          </>
        )}
      </main>

      <ProjectFormModal
        open={projectModal.open}
        project={projectModal.project}
        token={token}
        onClose={() => setProjectModal({ open: false, project: null })}
        onSaved={handleProjectSaved}
      />
      <PostFormModal
        open={postModal.open}
        post={postModal.post}
        token={token}
        onClose={() => setPostModal({ open: false, post: null })}
        onSaved={handlePostSaved}
      />
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.onConfirm}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
      />
    </div>
  );
}
