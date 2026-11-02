import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import PageHero from '../components/PageHero';
import ProjectCard from '../components/ProjectCard';
import { EmptyState, ErrorState, ProjectCardSkeleton } from '../components/Feedback';
import { api } from '../api/client';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { pluralize } from '../utils/format';

export default function Projects() {
  useDocumentTitle('Selected work');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.projects.list();
        if (!cancelled) setProjects(data || []);
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

  const technologies = useMemo(() => {
    const unique = new Set();
    projects.forEach((project) => {
      (project.techStack || []).forEach((tech) => unique.add(tech));
    });
    return ['All', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [projects]);

  const filtered = useMemo(
    () =>
      filter === 'All'
        ? projects
        : projects.filter((project) => (project.techStack || []).includes(filter)),
    [projects, filter]
  );

  return (
    <>
      <PageHero
        index="01"
        label="Selected work"
        title={
          <>
            Things built with
            <span className="block italic text-terracotta">care and curiosity.</span>
          </>
        }
        description="A selection of product design and full-stack engineering work — from early research to the last deploy. Each project is a different shape of the same question: how can this feel simpler?"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip">{pluralize(projects.length, 'project')}</span>
          <span className="chip">2024 — 2026</span>
        </div>
      </PageHero>

      <section className="pb-24">
        <div className="container-editorial">
          <div className="flex flex-col justify-between gap-4 border-y border-line py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-muted">
              <SlidersHorizontal size={14} />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em]">
                Filter by toolkit
              </span>
            </div>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
              {technologies.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setFilter(tech)}
                  className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] transition ${
                    filter === tech
                      ? 'border-ink bg-ink text-cream'
                      : 'border-line bg-cream/50 text-muted hover:border-ink/40 hover:text-ink'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3].map((item) => (
                  <ProjectCardSkeleton key={item} />
                ))}
              </div>
            ) : error ? (
              <ErrorState
                title="The work didn’t load."
                message={error.message}
                onRetry={() => setReloadKey((key) => key + 1)}
              />
            ) : filtered.length ? (
              <>
                <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((project, index) => (
                    <ProjectCard key={project._id} project={project} index={index} />
                  ))}
                </div>
                <p className="mt-12 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                  Showing {filtered.length} of {projects.length} projects
                </p>
              </>
            ) : (
              <EmptyState
                title="No projects match that toolkit."
                message="Try another filter, or browse the full collection."
                action={
                  <button type="button" onClick={() => setFilter('All')} className="btn-outline">
                    Clear filter
                  </button>
                }
              />
            )}
          </div>

          <div className="mt-20 flex flex-col items-start justify-between gap-5 rounded-[1.8rem] border border-line bg-cream/65 p-7 sm:flex-row sm:items-center sm:p-9">
            <div>
              <p className="eyebrow">The archive is growing</p>
              <p className="mt-2 font-display text-2xl tracking-[-0.02em]">
                A few more things are still in the workshop.
              </p>
            </div>
            <a href="mailto:hello@alexchen.dev" className="btn-outline shrink-0">
              Ask for the full case studies
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
