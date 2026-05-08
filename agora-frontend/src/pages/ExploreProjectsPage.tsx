import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../api/axios';

type Project = {
  id: number;
  title: string;
  description: string;
  category: string;
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

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
        ))}

        {!isLoading && projects.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-[var(--agora-muted)]">Nenhum projeto encontrado.</div>
        )}

        {!isLoading && projects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="rounded-3xl border border-[var(--agora-border)] bg-white/95 p-6 shadow-[var(--agora-shadow)] transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[var(--agora-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--agora-accent)]">{project.category}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[var(--agora-ink)]">{project.title}</h3>
            <p className="mt-2 text-sm text-[var(--agora-muted)] line-clamp-2">{project.description}</p>
            <div className="mt-5 flex items-center justify-between text-xs text-[var(--agora-muted)]">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1">👁️ {new Intl.NumberFormat('pt-BR').format(project.viewCount)}</span>
                <span className="flex items-center gap-1">📥 {new Intl.NumberFormat('pt-BR').format(project.downloadCount)}</span>
              </div>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">{project.averageGrade?.toFixed(1) ?? '--'}</span>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
};

export default ExploreProjectsPage;
