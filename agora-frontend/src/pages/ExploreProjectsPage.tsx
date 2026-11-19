import { Link } from 'react-router-dom';
import { BookOpen, Download, Eye, Star, Users } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Pagination from '@/components/Pagination';
import RoleBadge from '@/components/RoleBadge';
import { useExplore, EXPLORE_CATEGORY_FILTERS, EXPLORE_AREA_FILTERS } from '@/features/explore/hooks/useExplore';

const ExploreProjectCardSkeleton = () => (
  <div className="flex flex-col rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] overflow-hidden animate-pulse">
    <div className="h-40 w-full bg-[var(--agora-border)]/60" />
    <div className="flex flex-col flex-1 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 rounded-full bg-[var(--agora-border)]/70" />
        <div className="h-5 w-10 rounded bg-[var(--agora-border)]/60" />
      </div>
      <div className="h-5 w-4/5 rounded bg-[var(--agora-border)]/70" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 w-full rounded bg-[var(--agora-border)]/50" />
        <div className="h-3.5 w-2/3 rounded bg-[var(--agora-border)]/50" />
      </div>
      <div className="pt-4 border-t border-[var(--agora-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[var(--agora-border)]/70" />
          <div className="h-3.5 w-24 rounded bg-[var(--agora-border)]/60" />
        </div>
        <div className="h-3.5 w-14 rounded bg-[var(--agora-border)]/50" />
      </div>
    </div>
  </div>
);

const ExploreStudentCardSkeleton = () => (
  <div className="flex items-center gap-4 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-4 animate-pulse">
    <div className="h-14 w-14 rounded-full bg-[var(--agora-border)]/70 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-3/5 rounded bg-[var(--agora-border)]/70" />
      <div className="h-3.5 w-2/5 rounded bg-[var(--agora-border)]/50" />
    </div>
  </div>
);

const ExploreProjectsPage = () => {
  const {
    tab,
    activeCategory,
    setActiveCategory,
    activeArea,
    setActiveArea,
    projects,
    projectsPage,
    projectsTotalPages,
    projectsTotalCount,
    setProjectsPage,
    students,
    isLoadingProjects,
    isLoadingStudents,
    error,
    switchTab,
    formatCategory,
  } = useExplore();

  const handlePageChange = (newPage: number) => {
    setProjectsPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {EXPLORE_CATEGORY_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveCategory(filter.key)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
                    activeCategory === filter.key
                      ? 'border-[var(--agora-accent)] text-[var(--agora-accent)] bg-[var(--agora-accent-bg)]'
                      : 'border-[var(--agora-border)] text-[var(--agora-muted)] bg-[var(--agora-panel)] hover:text-[var(--agora-ink)] hover:border-[var(--agora-accent)]/40'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <select
              aria-label="Filtrar por área temática"
              value={activeArea}
              onChange={(e) => setActiveArea(e.target.value)}
              className="px-3.5 py-1.5 text-sm font-semibold rounded-lg border border-[var(--agora-border)] bg-[var(--agora-panel)] text-[var(--agora-ink)] outline-none focus:border-[var(--agora-accent)] transition-colors"
            >
              {EXPLORE_AREA_FILTERS.map((area) => (
                <option key={area.key} value={area.key}>
                  {area.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex items-center">
            <p className="text-sm text-[var(--agora-muted)]">
              {isLoadingProjects
                ? 'Carregando projetos...'
                : `${projectsTotalCount} ${projectsTotalCount === 1 ? 'projeto' : 'projetos'}`}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {isLoadingProjects && Array.from({ length: 6 }).map((_, i) => (
              <ExploreProjectCardSkeleton key={i} />
            ))}

            {!isLoadingProjects && projects.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-[var(--agora-border)] p-8 text-center text-sm text-[var(--agora-muted)]">
                Nenhum projeto encontrado.
              </div>
            )}

            {!isLoadingProjects && projects.map((project) => (
              <Link
                key={project.publicId}
                to={`/projects/${project.publicId}`}
                className="group flex flex-col rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)] overflow-hidden transition-colors duration-200 hover:border-[var(--agora-accent)]/50"
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
                      <RoleBadge role={project.authorRoleType} />
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

          {!isLoadingProjects && (
            <Pagination
              page={projectsPage}
              totalPages={projectsTotalPages}
              totalCount={projectsTotalCount}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Students tab */}
      {tab === 'students' && (
        <>
          <div className="mt-6 flex items-center">
            <p className="text-sm text-[var(--agora-muted)]">
              {isLoadingStudents ? 'Carregando alunos...' : `${students.length} alunos`}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoadingStudents && Array.from({ length: 6 }).map((_, i) => (
              <ExploreStudentCardSkeleton key={i} />
            ))}

            {!isLoadingStudents && students.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-[var(--agora-border)] p-8 text-center text-sm text-[var(--agora-muted)]">
                Nenhum aluno encontrado.
              </div>
            )}

            {!isLoadingStudents && students.map((student) => (
              <Link
                key={student.id}
                to={`/profile/${student.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)] p-4 transition-colors duration-200 hover:border-[var(--agora-accent)]/50"
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
