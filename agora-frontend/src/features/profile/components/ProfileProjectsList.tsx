import { Link } from 'react-router-dom';
import { BookOpen, Lock, Star } from 'lucide-react';
import { formatCategory } from '@/shared/utils/formatters';
import type { ProfileProject } from '../types';

type ProfileProjectsListProps = {
  projects: ProfileProject[];
  collaboratedProjects: ProfileProject[];
};

const ProfileProjectsList = ({ projects, collaboratedProjects }: ProfileProjectsListProps) => (
  <>
    <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
      <h3 className="text-xl font-bold text-[var(--agora-ink)] mb-6">Projetos Publicados</h3>
      {projects.length === 0 ? (
        <p className="text-center text-[var(--agora-muted)] py-8">Nenhum projeto publicado ainda</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="flex items-center gap-4 p-5 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-panel)] hover:bg-[var(--agora-accent-bg)] transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0a5c2f] flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-[var(--agora-ink)] truncate">{project.title}</h4>
                  {project.isPrivate && (
                    <span title="Projeto Privado" className="text-sm">
                      <Lock size={16} className="text-gray-400" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-[var(--agora-muted)]">
                  <span>{formatCategory(project.category)}</span>
                  <span>•</span>
                  <span>{new Date(project.createdAt).getFullYear()}</span>
                </div>
              </div>
              {project.averageGrade != null && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                  <Star className="w-5 h-5 fill-emerald-600" />
                  <span>{project.averageGrade.toFixed(1)}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>

    {collaboratedProjects.length > 0 && (
      <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
        <h3 className="text-xl font-bold text-[var(--agora-ink)] mb-6">Colaborações</h3>
        <div className="space-y-4">
          {collaboratedProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="flex items-center gap-4 p-5 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-panel)] hover:bg-[var(--agora-accent-bg)] transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[var(--agora-ink)] truncate">{project.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-[var(--agora-muted)]">
                  <span>{formatCategory(project.category)}</span>
                  <span>•</span>
                  <span>{new Date(project.createdAt).getFullYear()}</span>
                </div>
              </div>
              {project.averageGrade != null && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                  <Star className="w-5 h-5 fill-emerald-600" />
                  <span>{project.averageGrade.toFixed(1)}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    )}
  </>
);

export default ProfileProjectsList;
