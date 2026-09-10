import { Link } from 'react-router-dom';
import { Compass, GraduationCap, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import type { MentoredProject } from '../types';
import { THEMATIC_AREA_LABELS, type ThematicArea } from '@/constants/thematicAreas';

type MentoredProjectsListProps = {
  projects: MentoredProject[];
};

const MentoredProjectsList = ({ projects = [] }: MentoredProjectsListProps) => {
  return (
    <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-4 sm:p-6 shadow-[var(--agora-shadow)] mt-8 mb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#0a5c2f]/10 text-[#0a5c2f] flex-shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--agora-ink)]">
              Projetos sob sua Orientação
            </h2>
            <p className="text-xs text-[var(--agora-muted)]">
              Projetos acadêmicos que você mentora atualmente
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0a5c2f]/15 text-[#0a5c2f] self-start sm:self-auto flex-shrink-0">
          {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--agora-border)] p-8 text-center">
          <GraduationCap size={36} className="mx-auto mb-2 text-[var(--agora-muted)] opacity-50" />
          <p className="text-sm font-semibold text-[var(--agora-ink)]">
            Nenhuma mentoria ativa no momento
          </p>
          <p className="text-xs text-[var(--agora-muted)] mt-1 max-w-md mx-auto">
            Você ainda não está orientando nenhum projeto. Navegue pelo feed de projetos para descobrir trabalhos dos alunos e oferecer sua mentoria acadêmica!
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Compass size={14} />
            Explorar Projetos Acadêmicos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.mentorshipId}
              to={`/projects/${project.projectId}`}
              className="group flex flex-col justify-between rounded-xl border border-[var(--agora-border)] bg-[var(--agora-card-bg)] p-4 hover:border-[#0a5c2f] hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center rounded-full bg-[var(--agora-accent-bg)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--agora-accent)]">
                    {THEMATIC_AREA_LABELS[project.thematicAreaName as ThematicArea] || project.thematicAreaName}
                  </span>
                  {project.pendingReviewGoals > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                      <AlertCircle size={11} />
                      {project.pendingReviewGoals} revisão pendente
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-[var(--agora-ink)] line-clamp-1 group-hover:text-[#0a5c2f] transition-colors mb-1">
                  {project.title}
                </h3>

                {project.summary && (
                  <p className="text-xs text-[var(--agora-muted)] line-clamp-2 leading-relaxed mb-3">
                    {project.summary}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--agora-border)] mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {project.authorPhotoUrl ? (
                    <img
                      src={project.authorPhotoUrl}
                      alt={project.authorName}
                      className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-[#0a5c2f]/20 text-[#0a5c2f] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {project.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-[var(--agora-muted)] truncate">
                    {project.authorName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[var(--agora-muted)]">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {project.completedGoals}/{project.totalGoals} metas
                  </span>
                  <ChevronRight size={14} className="text-[var(--agora-muted)] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentoredProjectsList;
