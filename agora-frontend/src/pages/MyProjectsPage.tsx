import { Link } from 'react-router-dom';
import { Calendar, Eye, Plus, Star, Edit, Trash2, Lock } from 'lucide-react';
import AppShell from '@/components/AppShell';
import Pagination from '@/components/Pagination';
import { useMyProjects, MY_PROJECTS_FILTERS } from '@/features/my-projects/hooks/useMyProjects';

const MyProjectCardSkeleton = () => (
  <div className="flex flex-col rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] overflow-hidden animate-pulse">
    <div className="h-36 w-full bg-[var(--agora-border)]/60" />
    <div className="p-5 flex flex-col flex-1 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 rounded-full bg-[var(--agora-border)]/70" />
        <div className="flex gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--agora-border)]/60" />
          <div className="h-8 w-8 rounded-lg bg-[var(--agora-border)]/60" />
        </div>
      </div>
      <div className="h-5 w-4/5 rounded bg-[var(--agora-border)]/70" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 w-full rounded bg-[var(--agora-border)]/50" />
        <div className="h-3.5 w-2/3 rounded bg-[var(--agora-border)]/50" />
      </div>
      <div className="pt-4 border-t border-[var(--agora-border)] flex items-center gap-3">
        <div className="h-3.5 w-10 rounded bg-[var(--agora-border)]/60" />
        <div className="h-3.5 w-10 rounded bg-[var(--agora-border)]/60" />
        <div className="h-3.5 w-20 rounded bg-[var(--agora-border)]/50" />
      </div>
    </div>
  </div>
);

const MyProjectsPage = () => {
  const {
    activeFilter,
    setActiveFilter,
    page,
    totalPages,
    totalCount,
    setPage,
    projects,
    isLoading,
    deleteModal,
    isDeleting,
    error,
    handleDelete,
    handleEdit,
    confirmDelete,
    closeDeleteModal,
    formatCategory,
    formatDate,
  } = useMyProjects();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell
      title="Meus Projetos"
      subtitle="Gerencie todos os seus trabalhos acadêmicos."
      headerActions={
        <Link
          to="/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a5c2f] hover:bg-[#084925] text-white text-sm font-semibold rounded transition-colors"
        >
          <Plus size={16} />
          Novo Projeto
        </Link>
      }
    >
      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-6">
        {MY_PROJECTS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
              activeFilter === filter.key
                ? 'border-[var(--agora-accent)] text-[var(--agora-accent)] bg-[var(--agora-accent-bg)]'
                : 'border-[var(--agora-border)] text-[var(--agora-muted)] bg-[var(--agora-panel)] hover:text-[var(--agora-ink)] hover:border-[var(--agora-accent)]/40'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <MyProjectCardSkeleton key={`skeleton-${index}`} />
          ))}

        {!isLoading && projects.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-[var(--agora-border)] p-8 text-center text-sm text-[var(--agora-muted)]">
            Nenhum projeto encontrado.
          </div>
        )}

        {!isLoading &&
          projects.map((project) => (
            <div
              key={project.publicId}
              className="group relative flex flex-col bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl shadow-[var(--agora-shadow)] overflow-hidden transition-colors duration-200 hover:border-[var(--agora-accent)]/50"
            >
              {/* Cover image */}
              <Link to={`/projects/${project.publicId}`} className="block h-36 bg-[var(--agora-bg)] overflow-hidden flex-shrink-0">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl font-black text-[var(--agora-border)] select-none">
                      {project.title.charAt(0)}
                    </div>
                  </div>
                )}
              </Link>

              <div className="p-5 flex flex-col flex-1">
                {/* Botões de ação */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--agora-accent-bg)] text-[var(--agora-accent)]">
                      {formatCategory(project.category)}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => handleEdit(project.publicId, e)}
                      className="h-8 w-8 rounded-lg bg-[var(--agora-bg)] text-[var(--agora-muted)] flex items-center justify-center hover:text-[var(--agora-accent)] hover:bg-[var(--agora-accent-bg)] transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => confirmDelete(project.publicId, project.title, e)}
                      className="h-8 w-8 rounded-lg bg-[var(--agora-bg)] text-[var(--agora-muted)] flex items-center justify-center hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link to={`/projects/${project.publicId}`} className="block flex-1">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="font-bold text-[var(--agora-ink)] group-hover:text-[var(--agora-accent)] transition-colors leading-snug line-clamp-2 flex-1">
                      {project.title}
                    </h3>
                    {project.isPrivate && (
                      <div title="Projeto Privado" className="mt-1">
                        <Lock size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[var(--agora-muted)] line-clamp-2">{project.description}</p>

                  <div className="mt-4 pt-4 border-t border-[var(--agora-border)] flex items-center gap-3 text-xs text-[var(--agora-muted)]">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" />{project.averageGrade?.toFixed(1) ?? '--'}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{new Intl.NumberFormat('pt-BR').format(project.viewCount)}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(project.createdAt)}</span>
                  </div>
                </Link>
              </div>
            </div>
          ))}
      </div>

      {!isLoading && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-[var(--agora-ink)] mb-2">Excluir projeto</h3>
            <p className="text-sm text-[var(--agora-muted)] mb-6">
              Tem certeza que deseja excluir <span className="font-semibold text-[var(--agora-ink)]">"{deleteModal.projectTitle}"</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-2 border border-[var(--agora-border)] rounded text-sm font-semibold text-[var(--agora-muted)] hover:bg-[var(--agora-bg)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default MyProjectsPage;
