import { Link } from 'react-router-dom';
import { BookOpen, FolderOpen, Lock, Star } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { formatCategory } from '@/shared/utils/formatters';
import type { ProfileProject } from '../types';

type ProfileProjectsListProps = {
  projects: ProfileProject[];
  projectsPage: number;
  projectsTotalPages: number;
  projectsTotalCount: number;
  isLoadingProjects: boolean;
  onProjectsPageChange: (page: number) => void;
  collaboratedProjects: ProfileProject[];
  collabPage: number;
  collabTotalPages: number;
  collabTotalCount: number;
  isLoadingCollabs: boolean;
  onCollabPageChange: (page: number) => void;
};

const ProjectRow = ({
  project,
  iconBg,
}: {
  project: ProfileProject;
  iconBg: string;
}) => (
  <Link
    to={`/projects/${project.id}`}
    className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-bg)]/40 hover:bg-[var(--agora-accent-bg)]/60 hover:border-[var(--agora-accent)]/40 transition-colors duration-200"
  >
    <div
      className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-xs`}
    >
      <BookOpen className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-[var(--agora-ink)] group-hover:text-[var(--agora-accent)] transition-colors truncate">
          {project.title}
        </h4>
        {project.isPrivate && (
          <span title="Projeto Privado" className="text-[var(--agora-muted)] flex-shrink-0">
            <Lock size={14} />
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-[var(--agora-muted)]">
        <span>{formatCategory(project.category)}</span>
        <span>•</span>
        <span>{new Date(project.createdAt).getFullYear()}</span>
      </div>
    </div>
    {project.averageGrade != null && (
      <div className="flex items-center gap-1.5 rounded-lg bg-[var(--agora-accent-bg)] px-2.5 py-1 text-[var(--agora-accent)] font-bold text-sm flex-shrink-0">
        <Star className="w-4 h-4 fill-current" />
        <span>{project.averageGrade.toFixed(1)}</span>
      </div>
    )}
  </Link>
);

const ProjectRowsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-bg)]/40 animate-pulse"
      >
        <div className="w-12 h-12 rounded-xl bg-[var(--agora-border)]/70 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-[var(--agora-border)]/70" />
          <div className="h-3 w-1/3 rounded bg-[var(--agora-border)]/50" />
        </div>
      </div>
    ))}
  </div>
);

const ProfileProjectsList = ({
  projects,
  projectsPage,
  projectsTotalPages,
  projectsTotalCount,
  isLoadingProjects,
  onProjectsPageChange,
  collaboratedProjects,
  collabPage,
  collabTotalPages,
  collabTotalCount,
  isLoadingCollabs,
  onCollabPageChange,
}: ProfileProjectsListProps) => (
  <div className="space-y-6">
    <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl shadow-[var(--agora-shadow)] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-[var(--agora-ink)]">Projetos Publicados</h3>
        <span className="text-xs font-semibold text-[var(--agora-muted)] bg-[var(--agora-bg)] border border-[var(--agora-border)] px-2.5 py-1 rounded-full">
          {projectsTotalCount}
        </span>
      </div>

      {isLoadingProjects ? (
        <ProjectRowsSkeleton />
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed border-[var(--agora-border)]">
          <FolderOpen className="w-8 h-8 text-[var(--agora-muted)] mb-2 opacity-70" />
          <p className="text-sm text-[var(--agora-muted)]">Nenhum projeto publicado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} iconBg="bg-[#0a5c2f]" />
          ))}
        </div>
      )}

      <Pagination
        page={projectsPage}
        totalPages={projectsTotalPages}
        totalCount={projectsTotalCount}
        onPageChange={onProjectsPageChange}
      />
    </section>

    {(collaboratedProjects.length > 0 || collabTotalCount > 0) && (
      <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl shadow-[var(--agora-shadow)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[var(--agora-ink)]">Colaborações</h3>
          <span className="text-xs font-semibold text-[var(--agora-muted)] bg-[var(--agora-bg)] border border-[var(--agora-border)] px-2.5 py-1 rounded-full">
            {collabTotalCount}
          </span>
        </div>

        {isLoadingCollabs ? (
          <ProjectRowsSkeleton />
        ) : (
          <div className="space-y-3">
            {collaboratedProjects.map((project) => (
              <ProjectRow key={project.id} project={project} iconBg="bg-emerald-600" />
            ))}
          </div>
        )}

        <Pagination
          page={collabPage}
          totalPages={collabTotalPages}
          totalCount={collabTotalCount}
          onPageChange={onCollabPageChange}
        />
      </section>
    )}
  </div>
);

export default ProfileProjectsList;
