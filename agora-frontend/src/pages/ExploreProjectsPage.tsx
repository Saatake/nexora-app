import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Eye, Star } from 'lucide-react';
import AppShell from '../components/AppShell';
import api from '../api/axios';

type Project = {
  id: number;
  title: string;
  description: string;
  summary?: string | null;
  course?: string | null;
  category: string;
  authorName?: string;
  averageGrade?: number | null;
  viewCount: number;
  downloadCount: number;
  imageUrl?: string | null;
  createdAt: string;
};

const formatCategory = (category: string) => {
  const lookup: Record<string, string> = {
    Tcc: 'TCC', Upx: 'UPX', IniciacaoCientifica: 'IC',
    Relatorio: 'Relatório', ProjetoEscrito: 'Projeto escrito'
  };
  return lookup[category] ?? category;
};

const ExploreProjectsPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('search') ?? undefined;
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get('/projects', { params: { search: q, page: 1, pageSize: 24 } });
        if (!isMounted) return;
        setProjects(response.data.items ?? response.data ?? []);
      } catch (err) {
        if (isMounted) setError('Nao foi possivel carregar projetos.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [q]);

  return (
    <AppShell title="Explorar Projetos" subtitle="Descubra trabalhos academicos de toda a universidade">
      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <p className="text-lg text-slate-600">
          {isLoading ? 'Carregando projetos...' : `${projects.length} projetos`}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-[var(--agora-border)] animate-pulse" />
        ))}

        {!isLoading && projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--agora-border)] p-8 text-sm text-[var(--agora-muted)]">Nenhum projeto encontrado.</div>
        )}

        {!isLoading && projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="group flex flex-col rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)] overflow-hidden transition hover:-translate-y-1 hover:border-[var(--agora-accent)] hover:shadow-md"
          >
            {/* Cover image */}
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
    </AppShell>
  );
};

export default ExploreProjectsPage;
