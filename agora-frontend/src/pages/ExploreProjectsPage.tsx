import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Star, Users } from 'lucide-react';
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
  createdAt: string;
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

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-96 rounded-xl bg-slate-100 animate-pulse" />
        ))}

        {!isLoading && projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-sm text-[var(--agora-muted)]">Nenhum projeto encontrado.</div>
        )}

        {!isLoading && projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="group flex h-full flex-col rounded-xl border border-[var(--agora-border)] bg-white p-6 shadow-[var(--agora-shadow)] transition hover:-translate-y-1 hover:border-[#0a5c2f] hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-[#0a5c2f]">
                {project.category}
              </span>
              <span className="flex items-center gap-1 text-xl font-semibold text-amber-500">
                <Star size={22} className="fill-amber-500 text-amber-500" />
                {project.averageGrade?.toFixed(1) ?? '--'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-[1.5rem] font-bold leading-tight text-[var(--agora-ink)] transition group-hover:text-[#0a5c2f]">
                {project.title}
              </h3>
              <p className="text-base text-[var(--agora-muted)]">
                {project.course ? `${project.course} • ` : ''}
                {project.createdAt ? new Date(project.createdAt).getFullYear() : '--'}
                {project.authorName ? ` • ${project.authorName}` : ''}
              </p>
              <p className="text-base leading-relaxed text-[var(--agora-muted)] line-clamp-3">
                {project.summary || project.description}
              </p>
            </div>

            <div className="mt-auto pt-8">
              <div className="border-t border-[var(--agora-border)] pt-5">
                <div className="flex items-center justify-between text-base text-[var(--agora-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <Users size={18} />
                    {new Intl.NumberFormat('pt-BR').format(project.downloadCount)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Eye size={18} />
                    {new Intl.NumberFormat('pt-BR').format(project.viewCount)}
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
