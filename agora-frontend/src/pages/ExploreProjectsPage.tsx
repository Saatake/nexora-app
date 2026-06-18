import { Link } from 'react-router-dom';
import { BookOpen, Download, Eye, Star, Users } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useExplore } from '@/features/explore/hooks/useExplore';

const ExploreProjectsPage = () => {
  const { tab, projects, students, isLoadingProjects, isLoadingStudents, error, switchTab, formatCategory } = useExplore();

  return (
    <AppShell title="Explorar" subtitle="Descubra projetos e alunos da universidade">
      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b border-[var(--agora-border)]">
        <button
          onClick={() => switchTab('projects')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab !== 'students'
              ? 'border-[var(--agora-accent)] text-[var(--agora-accent)]'
              : 'border-transparent text-[var(--agora-muted)] hover:text-[var(--agora-ink)]'
          }`}
        >
          <BookOpen size={15} />
          Projetos
        </button>
        <button
          onClick={() => switchTab('students')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'students'
              ? 'border-[var(--agora-accent)] text-[var(--agora-accent)]'
              : 'border-transparent text-[var(--agora-muted)] hover:text-[var(--agora-ink)]'
          }`}
        >
          <Users size={15} />
          Alunos
        </button>
      </div>

      {/* Projects tab */}
      {tab !== 'students' && (
        <>
          <div className="mt-6 flex items-center">
            <p className="text-sm text-[var(--agora-muted)]">
              {isLoadingProjects ? 'Carregando...' : `${projects.length} projetos`}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {isLoadingProjects && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-[var(--agora-border)] animate-pulse" />
            ))}

            {!isLoadingProjects && projects.length === 0 && (
              <div className="col-span-3 rounded-xl border border-dashed border-[var(--agora-border)] p-8 text-sm text-[var(--agora-muted)]">
                Nenhum projeto encontrado.
              </div>
            )}

            {!isLoadingProjects && projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group flex flex-col rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)] overflow-hidden transition hover:-translate-y-1 hover:border-[var(--agora-accent)] hover:shadow-md"
              >
                <div className="h-40 w-full bg-[var(--agora-bg)] overflow-hidden flex-shrink-0">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-4xl font-black text-[var(--agora-border)] select-none">
                        {project.title.charAt(0)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--agora-accent-bg)] text-[var(--agora-accent)]">
                      {formatCategory(project.category)}
                    </span>
                    {project.averageGrade != null && (
                      <span className="flex items-center gap-1 text-base font-bold text-amber-500 flex-shrink-0">
                        <Star size={16} className="fill-amber-400 text-amber-400" />
                        {project.averageGrade.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold leading-snug text-[var(--agora-ink)] group-hover:text-[var(--agora-accent)] transition-colors mb-2 line-clamp-2">
                    {project.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[var(--agora-muted)] line-clamp-2 flex-1">
                    {project.summary || project.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[var(--agora-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[var(--agora-accent)] flex items-center justify-center text-white font-bold text-xs">
                        {(project.authorName ?? 'A').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-[var(--agora-muted)] truncate max-w-[120px]">{project.authorName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--agora-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={13} />
                        {new Intl.NumberFormat('pt-BR').format(project.viewCount)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Download size={13} />
                        {new Intl.NumberFormat('pt-BR').format(project.downloadCount)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Students tab */}
      {tab === 'students' && (
        <>
          <div className="mt-6 flex items-center">
            <p className="text-sm text-[var(--agora-muted)]">
              {isLoadingStudents ? 'Carregando...' : `${students.length} alunos`}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoadingStudents && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-[var(--agora-border)] animate-pulse" />
            ))}

            {!isLoadingStudents && students.length === 0 && (
              <div className="col-span-3 rounded-xl border border-dashed border-[var(--agora-border)] p-8 text-sm text-[var(--agora-muted)]">
                Nenhum aluno encontrado.
              </div>
            )}

            {!isLoadingStudents && students.map((student) => (
              <Link
                key={student.id}
                to={`/profile/${student.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--agora-accent)] hover:shadow-md"
              >
                <div className="flex-shrink-0 h-14 w-14 rounded-full overflow-hidden bg-[var(--agora-accent)] flex items-center justify-center text-white text-xl font-bold">
                  {student.photoUrl
                    ? <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                    : student.name.charAt(0).toUpperCase()
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--agora-ink)] group-hover:text-[var(--agora-accent)] transition-colors truncate">
                    {student.name}
                  </p>
                  {student.course && (
                    <p className="text-sm text-[var(--agora-muted)] truncate">{student.course}</p>
                  )}
                  {student.bio && (
                    <p className="text-xs text-[var(--agora-muted)] mt-1 line-clamp-1">{student.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
};

export default ExploreProjectsPage;
