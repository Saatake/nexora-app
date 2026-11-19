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

export const EXPLORE_AREA_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Todas as áreas' },
  { key: 'TecnologiaInovacao', label: 'Tecnologia e Inovação' },
  { key: 'EngenhariaIndustria', label: 'Engenharia e Indústria' },
  { key: 'SaudeBiotecnologia', label: 'Saúde e Biotecnologia' },
  { key: 'NegociosGestao', label: 'Negócios e Gestão' },
  { key: 'HumanidadesSociedadeDireito', label: 'Humanidades, Sociedade e Direito' },
  { key: 'ArtesDesignComunicacao', label: 'Artes, Design e Comunicação' },
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
  const [activeArea, setActiveAreaState] = useState<string>('all');
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

  const areaParam = useMemo(
    () => (activeArea === 'all' ? undefined : activeArea),
    [activeArea]
  );

  const setActiveCategory = (category: ExploreCategoryFilter) => {
    setActiveCategoryState(category);
    setProjectsPage(1);
  };

  const setActiveArea = (area: string) => {
    setActiveAreaState(area);
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
            thematicArea: areaParam,
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
  }, [q, categoryParam, areaParam, projectsPage]);

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
  };
};
