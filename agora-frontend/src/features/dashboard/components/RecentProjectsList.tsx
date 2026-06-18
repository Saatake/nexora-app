import { Link } from 'react-router-dom';
import { Eye, Star } from 'lucide-react';
import { formatCategory, formatDateShort } from '@/shared/utils/formatters';
import type { DashboardProject } from '../types';

type RecentProjectsListProps = {
  projects: DashboardProject[];
  isLoading: boolean;
};

const RecentProjectsList = ({ projects, isLoading }: RecentProjectsListProps) => (
  <section className="mt-6">
    <div className="flex items-center justify-between mb-4">
      <h2
        className="font-bold text-[var(--agora-ink)]"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        Projetos recentes
      </h2>
      <Link to="/projects" className="text-sm text-[#0a5c2f] hover:underline font-medium">
        Ver todos
      </Link>
    </div>
    <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl overflow-hidden shadow-[var(--agora-shadow)]">
      <div className="mt-5 space-y-4">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-[var(--agora-muted)]">
            Nenhum projeto publicado ainda.
          </div>
        )}

        {!isLoading &&
          projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-[var(--agora-accent-bg)] transition-colors border-b border-[var(--agora-border)] last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-green-100 text-[#0a5c2f]">
                  {formatCategory(project.category)}
                </span>
                <span className="font-medium text-[var(--agora-ink)] text-sm">{project.title}</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-[var(--agora-muted)]">
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-amber-400" />
                  {project.averageGrade?.toFixed(1) ?? '--'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={13} />
                  {new Intl.NumberFormat('pt-BR').format(project.viewCount)}
                </span>
                <span className="hidden sm:block">{formatDateShort(project.createdAt)}</span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  </section>
);

export default RecentProjectsList;
