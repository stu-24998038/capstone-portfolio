import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  Github,
  Layers,
} from 'lucide-react';
import ProjectArtwork from '../components/ProjectArtwork';
import ProjectCard from '../components/ProjectCard';
import { ErrorState, PageLoader } from '../components/Feedback';
import { api } from '../api/client';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useDocumentTitle(project?.title || 'Project');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [current, all] = await Promise.all([
          api.projects.get(id),
          api.projects.list(),
        ]);
        if (cancelled) return;
        setProject(current);
        setRelated(
          (all || []).filter((item) => item._id !== current._id).slice(0, 2)
        );
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

  if (loading) return <PageLoader label="Opening the case study…" />;

  if (error) {
    return (
      <section className="pt-36 pb-24">
        <div className="container-editorial">
          <Link
            to="/projects"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
          >
            <ArrowLeft size={15} />
            Back to work
          </Link>
          <ErrorState
            title={error.status === 404 ? 'This project has moved on.' : 'The project didn’t load.'}
            message={
              error.status === 404
                ? 'It may have been removed from the portfolio. The rest of the archive is still here.'
                : error.message
            }
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        </div>
      </section>
    );
  }

  return (
    <>
      <article>
        <header className="pb-10 pt-32 sm:pt-40">
          <div className="container-editorial">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
            >
              <ArrowLeft size={15} />
              All projects
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-8">
                <p className="eyebrow flex flex-wrap items-center gap-2">
                  <span>{project.year || '2026'}</span>
                  <span className="h-1 w-1 rounded-full bg-line" />
                  <span>{project.techStack?.[0] || 'Product'}</span>
                  {project.featured && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-line" />
                      <span className="text-terracotta">Featured project</span>
                    </>
                  )}
                </p>
                <h1 className="mt-5 max-w-4xl font-display text-[clamp(3rem,7vw,6.2rem)] font-light leading-[0.93] tracking-[-0.045em] text-balance">
                  {project.title}
                </h1>
              </div>

              <div className="flex flex-col justify-end gap-4 lg:col-span-4">
                <p className="max-w-md text-pretty text-[1.02rem] leading-relaxed text-muted">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                    >
                      View live
                      <ExternalLink size={15} />
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline"
                    >
                      <Github size={15} />
                      Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container-editorial">
          <ProjectArtwork
            project={project}
            index={0}
            className="shadow-soft"
            ratio="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
          />
        </div>

        <section className="section-pad">
          <div className="container-editorial grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="eyebrow">Overview</p>
              <h2 className="mt-3 font-display text-4xl font-light tracking-[-0.035em]">
                The short version.
              </h2>
              <div className="mt-6 space-y-5 text-pretty text-[1.02rem] leading-[1.85] text-ink/75">
                {String(project.description)
                  .split(/\n{2,}/)
                  .map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                <p>
                  This project was shaped end to end: framing the problem with the team,
                  mapping the experience, building the interface, and staying close to the
                  details through launch.
                </p>
              </div>
            </div>

            <aside className="lg:col-span-5 lg:pl-8">
              <div className="rounded-[1.8rem] border border-line bg-cream/65 p-7">
                <p className="eyebrow">Project details</p>
                <dl className="mt-6 space-y-5">
                  <div className="flex items-start justify-between gap-6 border-b border-line pb-5">
                    <dt className="flex items-center gap-2 text-sm text-muted">
                      <CalendarDays size={15} />
                      Year
                    </dt>
                    <dd className="text-sm font-medium">{project.year || '2026'}</dd>
                  </div>
                  <div className="border-b border-line pb-5">
                    <dt className="flex items-center gap-2 text-sm text-muted">
                      <Layers size={15} />
                      Toolkit
                    </dt>
                    <dd className="mt-3 flex flex-wrap gap-2">
                      {(project.techStack || []).map((tech) => (
                        <span key={tech} className="chip">
                          {tech}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">Role</dt>
                    <dd className="mt-1.5 text-sm font-medium">
                      Product design & full-stack development
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 rounded-[1.8rem] bg-forest p-7 text-cream">
                <p className="font-display text-[1.6rem] font-light leading-snug">
                  Want the longer story?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">
                  I’m happy to walk through the decisions, dead ends, and trade-offs behind
                  this work.
                </p>
                <Link to="/contact" className="btn-light mt-5">
                  Ask me about it
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-cream/55 py-16 sm:py-20">
          <div className="container-editorial">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Next up</p>
                <h2 className="mt-2 font-display text-[2.4rem] font-light tracking-[-0.03em]">
                  More from the archive.
                </h2>
              </div>
              <Link
                to="/projects"
                className="hidden items-center gap-2 text-sm font-medium sm:inline-flex"
              >
                All projects
                <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="grid gap-10 md:grid-cols-2">
              {related.map((item, index) => (
                <ProjectCard key={item._id} project={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
