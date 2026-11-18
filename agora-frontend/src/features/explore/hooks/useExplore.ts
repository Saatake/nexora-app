import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/api/axios';
import { formatCategory } from '@/shared/utils/formatters';

export type ExploreCategoryFilter =
  | 'all'
  | 'Tcc'
  | 'Upx'
  | 'IniciacaoCientifica'
  | 'Relatorio'
  | 'ProjetoEscrito';

export const EXPLORE_CATEGORY_FILTERS: { key: ExploreCategoryFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'Tcc', label: 'TCC' },
  { key: 'Upx', label: 'UPX' },
  { key: 'IniciacaoCientifica', label: 'Iniciação Científica' },
  { key: 'Relatorio', label: 'Relatório' },
  { key: 'ProjetoEscrito', label: 'Projeto Escrito' },
];

export type Project = {
  id: number;
  publicId: string;
  title: string;
  description: string;
  summary?: string | null;
  thematicAreaName?: string;
  tags?: string | null;
  category: string;
  authorName?: string;
  authorRoleType?: string;
  averageGrade?: number | null;
  viewCount: number;
  downloadCount: number;
  imageUrl?: string | null;
  createdAt: string;
};

export type Student = {
  id: string;
  name: string;
  course: string;
  bio: string;
  photoUrl?: string | null;
  interests?: string | null;
  roleType: string;
};

const PROJECTS_PAGE_SIZE = 12;

export const useExplore = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('search') ?? undefined;
  const tab = searchParams.get('tab') ?? 'projects';

  const [activeCategory, setActiveCategoryState] = useState<ExploreCategoryFilter>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsTotalPages, setProjectsTotalPages] = useState(1);
  const [projectsTotalCount, setProjectsTotalCount] = useState(0);

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [error, setError] = useState('');

  const categoryParam = useMemo(
    () => (activeCategory === 'all' ? undefined : activeCategory),
    [activeCategory]
  );

  const setActiveCategory = (category: ExploreCategoryFilter) => {
    setActiveCategoryState(category);
    setProjectsPage(1);
  };

  useEffect(() => {
    setProjectsPage(1);
  }, [q]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoadingProjects(true);
      setError('');
      try {
        const response = await api.get('/projects', {
          params: {
            search: q,
            category: categoryParam,
            page: projectsPage,
            pageSize: PROJECTS_PAGE_SIZE,
          },
        });
        if (!isMounted) return;
        const items = response.data.items ?? response.data ?? [];
        setProjects(items);
        setProjectsTotalPages(response.data.totalPages ?? 1);
        setProjectsTotalCount(response.data.totalCount ?? items.length);
      } catch {
        if (isMounted) setError('Não foi possível carregar projetos.');
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [q, categoryParam, projectsPage]);

  useEffect(() => {
    if (tab !== 'students') return;
    let isMounted = true;
    const load = async () => {
      setIsLoadingStudents(true);
      setError('');
      try {
        const response = await api.get('/users', { params: { search: q, page: 1, pageSize: 24 } });
        if (!isMounted) return;
        setStudents(response.data ?? []);
      } catch {
        if (isMounted) setError('Não foi possível carregar alunos.');
      } finally {
        if (isMounted) setIsLoadingStudents(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [q, tab]);

  const switchTab = (t: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', t);
    navigate(`/explore?${params.toString()}`);
  };

  return {
    tab,
    activeCategory,
    setActiveCategory,
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
  };
};
