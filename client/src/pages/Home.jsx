import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Code2,
  Compass,
  Database,
  Sparkles,
} from 'lucide-react';
import HeroCard from '../components/HeroCard';
import ProjectCard from '../components/ProjectCard';
import BlogCard from '../components/BlogCard';
import { ErrorState, PostCardSkeleton, ProjectCardSkeleton } from '../components/Feedback';
import { api } from '../api/client';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SERVICES = [
  {
    icon: Compass,
    title: 'Product design',
    description:
      'Research, flows, interface systems, and the unglamorous details that make a product feel obvious to use.',
    items: ['Product strategy', 'UX & UI design', 'Design systems'],
  },
  {
    icon: Code2,
    title: 'Front-end engineering',
    description:
      'Accessible, responsive React applications with considered motion and a strong visual point of view.',
    items: ['React & Vite', 'Tailwind CSS', 'Design engineering'],
  },
  {
    icon: Database,
    title: 'Back-end systems',
    description:
      'APIs and data models that are safe by default, documented clearly, and simple for the next person to extend.',
    items: ['Node & Express', 'MongoDB & Mongoose', 'Auth & deployment'],
  },
];

const MARQUEE = [
  'Product design',
  'React',
  'Interface systems',
  'Node.js',
  'MongoDB',
  'Design engineering',
  'Accessibility',
  'Express',
];

export default function Home() {
  useDocumentTitle(null);

  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [projectData, postData] = await Promise.all([
          api.projects.list(),
          api.blog.list(),
        ]);
        if (cancelled) return;
        setProjects(projectData || []);
        setPosts(postData || []);
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

  const selectedProjects = projects.slice(0, 3);
  const recentPosts = posts.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-40 lg:pb-24">
        <div
          className="pointer-events-none absolute -left-40 top-24 h-[30rem] w-[30rem] rounded-full bg-[#d95b39]/[0.06] blur-3xl"
          aria-hidden="true"
        />
        <div className="container-editorial relative">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10 xl:gap-16">
            <div className="lg:col-span-7">
              <p className="eyebrow flex items-center gap-3 animate-rise">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-terracotta" />
                </span>
                Independent designer & developer · Singapore
              </p>

              <h1
                className="mt-7 font-display text-[clamp(3.2rem,7.3vw,6.7rem)] font-light leading-[0.91] tracking-[-0.05em] text-balance animate-rise"
                style={{ animationDelay: '80ms' }}
              >
                Thoughtful digital products,{' '}
                <span className="italic text-terracotta">built end to end.</span>
              </h1>

              <p
                className="mt-7 max-w-xl text-pretty text-[1.02rem] leading-relaxed text-muted sm:text-[1.1rem] animate-rise"
                style={{ animationDelay: '160ms' }}
              >
                I’m Alex Chen. I design calm interfaces and build the systems behind them —
                from the first sketch to a deployed product people can rely on.
              </p>

              <div
                className="mt-9 flex flex-wrap items-center gap-3 animate-rise"
                style={{ animationDelay: '240ms' }}
              >
                <Link to="/projects" className="btn-primary">
                  View selected work
                  <ArrowUpRight size={16} />
                </Link>
                <Link to="/blog" className="btn-outline">
                  Read the journal
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div
                className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6 animate-rise"
                style={{ animationDelay: '320ms' }}
              >
                <div>
                  <p className="font-display text-3xl tracking-[-0.03em] sm:text-4xl">6+</p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.13em] text-muted">
                    Years making
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                    {String(projects.length || 4).padStart(2, '0')}
                  </p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.13em] text-muted">
                    Selected projects
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                    {String(posts.length || 3).padStart(2, '0')}
                  </p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.13em] text-muted">
                    Journal notes
                  </p>
                </div>
              </div>
            </div>

            <div
              className="lg:col-span-5 animate-rise"
              style={{ animationDelay: '180ms' }}
            >
              <HeroCard />
            </div>
          </div>

          <div className="mt-16 flex items-center justify-between border-t border-line pt-5 sm:mt-20">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted">
              Scroll to explore
            </p>
            <a
              href="#work"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:border-ink hover:bg-cream"
              aria-label="Scroll to selected work"
            >
              <ArrowDown size={16} />
            </a>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-line bg-cream/55 py-4">
        <div className="flex w-max animate-marquee items-center">
          {[0, 1].map((group) => (
            <div key={group} className="flex shrink-0 items-center" aria-hidden={group === 1}>
              {MARQUEE.map((item) => (
                <span
                  key={`${group}-${item}`}
                  className="flex items-center whitespace-nowrap px-6 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted"
                >
                  {item}
                  <Sparkles size={10} className="ml-6 text-terracotta/70" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section id="work" className="section-pad scroll-mt-20">
        <div className="container-editorial">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6 sm:mb-16">
            <div>
              <p className="eyebrow flex items-center gap-3">
                <span className="h-px w-8 bg-terracotta" />
                01 / Selected work
              </p>
              <h2 className="mt-4 max-w-2xl font-display text-[clamp(2.5rem,5vw,4.4rem)] font-light leading-[0.98] tracking-[-0.04em]">
                A few things I’ve made.
              </h2>
            </div>
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-sm font-medium transition hover:border-ink"
            >
              All projects
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <ProjectCardSkeleton key={item} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="The project shelf is out of reach."
              message={error.message}
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          ) : selectedProjects.length ? (
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {selectedProjects.map((project, index) => (
                <ProjectCard key={project._id} project={project} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center">
              <p className="font-display text-2xl">The first project is on its way.</p>
              <p className="mt-2 text-sm text-muted">
                Sign in to the dashboard to add a project to the portfolio.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="scroll-mt-20 border-y border-line bg-cream/55">
        <div className="container-editorial section-pad">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="eyebrow flex items-center gap-3">
                <span className="h-px w-8 bg-terracotta" />
                02 / About
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.6rem,5vw,4.6rem)] font-light leading-[0.96] tracking-[-0.04em]">
                A designer who
                <span className="block italic text-terracotta">ships.</span>
              </h2>

              <div className="relative mt-10 hidden max-w-sm overflow-hidden rounded-[1.7rem] bg-forest p-7 text-cream lg:block">
                <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-terracotta/80" />
                <div className="relative">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-cream/50">
                    A small manifesto
                  </p>
                  <p className="mt-5 font-display text-[1.65rem] font-light leading-[1.25]">
                    Clarity is a form of care. The best interfaces make people feel
                    <span className="italic text-[#e9b5a3]"> capable.</span>
                  </p>
                  <p className="mt-6 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-cream/45">
                    Alex Chen · 2026
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 lg:pt-14">
              <div className="space-y-5 text-pretty text-[1.02rem] leading-[1.85] text-ink/75 sm:text-[1.08rem]">
                <p>
                  I’m a product designer and full-stack developer with a soft spot for
                  editorial typography, useful defaults, and software that does one thing
                  properly. My work sits between design and engineering: close enough to the
                  code to know what is possible, close enough to the people using it to know
                  what matters.
                </p>
                <p>
                  Over the last six years I’ve helped climate, education, and community teams
                  turn complicated ideas into products that feel simple. I care about the
                  whole path — the research, the empty states, the API contract, the deploy
                  at 5pm on a Friday.
                </p>
                <p>
                  When I’m not making things, I’m usually walking somewhere with a notebook,
                  collecting field recordings, or trying to make a better cup of coffee.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 sm:grid-cols-3">
                <div>
                  <p className="font-display text-4xl tracking-[-0.03em]">06+</p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.13em] text-muted">
                    Years designing
                  </p>
                </div>
                <div>
                  <p className="font-display text-4xl tracking-[-0.03em]">24</p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.13em] text-muted">
                    Products shipped
                  </p>
                </div>
                <div>
                  <p className="font-display text-4xl tracking-[-0.03em]">∞</p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.13em] text-muted">
                    Notebooks filled
                  </p>
                </div>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/contact" className="btn-primary">
                  Work with me
                  <ArrowUpRight size={15} />
                </Link>
                <a
                  href="mailto:hello@alexchen.dev"
                  className="btn-outline"
                >
                  hello@alexchen.dev
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-editorial">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-terracotta" />
              03 / What I do
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.2rem)] font-light leading-[0.98] tracking-[-0.04em]">
              One brain, three modes.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[1.8rem] border border-line bg-line md:grid-cols-3">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group relative bg-paper p-7 transition-colors duration-500 hover:bg-cream sm:p-9"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-cream text-ink transition group-hover:border-terracotta group-hover:text-terracotta">
                      <Icon size={19} />
                    </span>
                    <span className="font-mono text-[0.6rem] tracking-[0.16em] text-muted">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-[1.7rem] tracking-[-0.025em]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{service.description}</p>
                  <ul className="mt-6 space-y-2 border-t border-line pt-5">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink/65"
                      >
                        <span className="h-1 w-1 rounded-full bg-terracotta" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-cream/55">
        <div className="container-editorial section-pad">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-14">
            <div>
              <p className="eyebrow flex items-center gap-3">
                <span className="h-px w-8 bg-terracotta" />
                04 / Journal
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.2rem)] font-light leading-[0.98] tracking-[-0.04em]">
                Notes from the work.
              </h2>
            </div>
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-sm font-medium transition hover:border-ink"
            >
              All notes
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-x-12 md:grid-cols-2">
              {[0, 1, 2].map((item) => (
                <PostCardSkeleton key={item} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              compact
              title="The journal is taking a moment."
              message={error.message}
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          ) : recentPosts.length ? (
            <div className="grid gap-x-12 md:grid-cols-2">
              {recentPosts.map((post, index) => (
                <BlogCard key={post._id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No notes published yet.</p>
          )}

          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-[1.8rem] bg-forest p-7 text-cream sm:flex-row sm:items-center sm:p-9">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream/10">
                <Sparkles size={17} />
              </span>
              <div>
                <p className="font-display text-2xl tracking-[-0.02em]">
                  Have a project that needs both halves?
                </p>
                <p className="mt-1 text-sm text-cream/60">
                  I take on a small number of collaborations each season.
                </p>
              </div>
            </div>
            <Link to="/contact" className="btn-light shrink-0">
              Start a conversation
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
