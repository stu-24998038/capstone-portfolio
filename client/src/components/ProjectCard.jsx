import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import ProjectArtwork from './ProjectArtwork';
import { clampText } from '../utils/format';

export default function ProjectCard({ project, index = 0 }) {
  return (
    <article className="group">
      <Link to={`/projects/${project._id}`} className="block">
        <ProjectArtwork project={project} index={index} />

        <div className="mt-5 flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="eyebrow flex flex-wrap items-center gap-2">
              <span>{project.year || '2026'}</span>
              <span className="h-1 w-1 rounded-full bg-line" />
              <span>{project.techStack?.[0] || 'Product'}</span>
              {project.featured && (
                <>
                  <span className="h-1 w-1 rounded-full bg-line" />
                  <span className="text-terracotta">Featured</span>
                </>
              )}
            </p>
            <h3 className="mt-2 font-display text-[1.75rem] leading-tight tracking-[-0.025em] transition-colors duration-300 group-hover:text-terracotta sm:text-[2rem]">
              {project.title}
            </h3>
          </div>
          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-cream/50 transition duration-300 ease-editorial group-hover:-translate-y-1 group-hover:border-ink group-hover:bg-ink group-hover:text-cream">
            <ArrowUpRight size={17} />
          </span>
        </div>

        <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted">
          {clampText(project.description, 145)}
        </p>

        {project.techStack?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
