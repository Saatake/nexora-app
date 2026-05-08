import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Download, Eye, Plus, Star } from 'lucide-react';
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
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <AppShell
      title="Meus Projetos"
      subtitle="Gerencie todos os seus trabalhos academicos"
      headerActions={
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--agora-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--agora-shadow)]"
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

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              activeFilter === filter.key
                ? 'bg-[var(--agora-accent)] text-white'
                : 'border border-[var(--agora-border)] bg-white text-[var(--agora-ink)] hover:border-[var(--agora-accent)]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
          ))}

        {!isLoading && projects.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-[var(--agora-muted)]">
            Nenhum projeto encontrado.
          </div>
        )}

        {!isLoading &&
          projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-3xl border border-[var(--agora-border)] bg-white/95 p-6 shadow-[var(--agora-shadow)] transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[var(--agora-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--agora-accent)]">
                  {formatCategory(project.category)}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    project.isApproved
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {project.isApproved ? 'Aprovado' : 'Em avaliacao'}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-[var(--agora-ink)]">{project.title}</h3>
              <p className="mt-2 text-sm text-[var(--agora-muted)] line-clamp-2">{project.description}</p>

              <div className="mt-5 flex items-center justify-between text-xs text-[var(--agora-muted)]">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {new Intl.NumberFormat('pt-BR').format(project.viewCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download size={14} />
                    {new Intl.NumberFormat('pt-BR').format(project.downloadCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(project.createdAt)}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <Star size={14} />
                  {project.averageGrade?.toFixed(1) ?? '--'}
                </span>
              </div>
            </Link>
          ))}
      </div>
    </AppShell>
  );
};

export default MyProjectsPage;
