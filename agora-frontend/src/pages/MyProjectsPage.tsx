import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Download, Eye, Plus, Star, Edit, Trash2 } from 'lucide-react';
import api from '../api/axios';
import AppShell from '../components/AppShell';

type Project = {
  id: number;
  title: string;
  description: string;
  category: string;
  averageGrade?: number | null;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  isApproved: boolean;
};

type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

type FilterKey = 'all' | 'Tcc' | 'Upx' | 'IniciacaoCientifica' | 'Relatorio' | 'ProjetoEscrito';

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'Tcc', label: 'TCC' },
  { key: 'Upx', label: 'UPX' },
  { key: 'IniciacaoCientifica', label: 'Iniciacao Cientifica' },
  { key: 'Relatorio', label: 'Relatorio' },
  { key: 'ProjetoEscrito', label: 'Projeto escrito' }
];

const formatCategory = (category: string) => {
  const lookup: Record<string, string> = {
    Tcc: 'TCC',
    Upx: 'UPX',
    IniciacaoCientifica: 'Iniciacao Cientifica',
    Relatorio: 'Relatorio',
    ProjetoEscrito: 'Projeto escrito'
  };
  return lookup[category] ?? category;
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Data desconhecida';
  return parsed.toLocaleDateString('pt-BR');
};

const MyProjectsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; projectId: number | null; projectTitle: string }>({
    show: false,
    projectId: null,
    projectTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const filterParam = useMemo(() => {
    if (activeFilter === 'all') return undefined;
    return activeFilter;
  }, [activeFilter]);

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get<PagedResponse<Project>>('/projects/me', {
          params: { page: 1, pageSize: 12, type: filterParam }
        });

        if (!isMounted) return;
        setProjects(response.data.items ?? []);
      } catch (err) {
        if (isMounted) setError('Nao foi possivel carregar seus projetos.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, [filterParam]);

  const handleDelete = async () => {
    if (!deleteModal.projectId) return;
    
    setIsDeleting(true);
    setError('');
    try {
      await api.delete(`/projects/${deleteModal.projectId}`);
      
      // Remover projeto da lista
      setProjects(projects.filter(p => p.id !== deleteModal.projectId));
      setDeleteModal({ show: false, projectId: null, projectTitle: '' });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir o projeto.';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (projectId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/projects/${projectId}/edit`);
  };

  const confirmDelete = (projectId: number, projectTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ show: true, projectId, projectTitle });
  };

  return (
    <AppShell
      title="Meus Projetos"
      subtitle="Gerencie todos os seus trabalhos academicos"
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
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-1.5 text-sm font-semibold rounded border transition-all ${
              activeFilter === filter.key
                ? 'border-green-800 text-green-800 bg-green-50'
                : 'border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="h-44 rounded-xl bg-slate-100 animate-pulse" />
          ))}

        {!isLoading && projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-[var(--agora-muted)]">
            Nenhum projeto encontrado.
          </div>
        )}

        {!isLoading &&
          projects.map((project) => (
            <div
              key={project.id}
              className="relative bg-white border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-5"
            >
              {/* Botões de ação */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={(e) => handleEdit(project.id, e)}
                  className="h-8 w-8 rounded bg-gray-100 text-[var(--agora-muted)] flex items-center justify-center hover:text-[#0a5c2f] hover:bg-green-50 transition"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => confirmDelete(project.id, project.title, e)}
                  className="h-8 w-8 rounded bg-gray-100 text-[var(--agora-muted)] flex items-center justify-center hover:text-red-600 hover:bg-red-50 transition"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <Link to={`/projects/${project.id}`} className="block">
                <div className="flex items-start justify-between mb-3 pr-20">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-green-100 text-[#0a5c2f]">
                    {formatCategory(project.category)}
                  </span>
                  {project.isApproved ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Aprovado</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Pendente</span>
                  )}
                </div>

                <h3 className="font-bold text-[var(--agora-ink)] mb-1 leading-snug">{project.title}</h3>
                <p className="text-sm text-[var(--agora-muted)] line-clamp-2 flex-1">{project.description}</p>

                <div className="mt-4 pt-4 border-t border-[var(--agora-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[var(--agora-muted)]">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" />{project.averageGrade?.toFixed(1) ?? '--'}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{new Intl.NumberFormat('pt-BR').format(project.viewCount)}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-[var(--agora-ink)] mb-2">Excluir projeto</h3>
            <p className="text-sm text-[var(--agora-muted)] mb-6">
              Tem certeza que deseja excluir <span className="font-semibold text-[var(--agora-ink)]">"{deleteModal.projectTitle}"</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, projectId: null, projectTitle: '' })}
                disabled={isDeleting}
                className="flex-1 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
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
