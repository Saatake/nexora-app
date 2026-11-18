import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { formatCategory, formatDate } from '@/shared/utils/formatters';

export type FilterKey = 'all' | 'Tcc' | 'Upx' | 'IniciacaoCientifica' | 'Relatorio' | 'ProjetoEscrito';

export type Project = {
  id: number;
  publicId: string;
  title: string;
  description: string;
  category: string;
  averageGrade?: number | null;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  isPrivate: boolean;
  imageUrl?: string | null;
};

type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export const MY_PROJECTS_FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'Tcc', label: 'TCC' },
  { key: 'Upx', label: 'UPX' },
  { key: 'IniciacaoCientifica', label: 'Iniciação Científica' },
  { key: 'Relatorio', label: 'Relatório' },
  { key: 'ProjetoEscrito', label: 'Projeto Escrito' },
];

const MY_PROJECTS_PAGE_SIZE = 12;

export const useMyProjects = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilterState] = useState<FilterKey>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    projectId: string | null;
    projectTitle: string;
  }>({ show: false, projectId: null, projectTitle: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const filterParam = useMemo(() => (activeFilter === 'all' ? undefined : activeFilter), [activeFilter]);

  const setActiveFilter = (filter: FilterKey) => {
    setActiveFilterState(filter);
    setPage(1);
  };

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get<PagedResponse<Project>>('/projects/me', {
          params: { page, pageSize: MY_PROJECTS_PAGE_SIZE, type: filterParam },
        });
        if (!isMounted) return;
        const items = response.data.items ?? [];
        setProjects(items);
        setTotalPages(response.data.totalPages ?? 1);
        setTotalCount(response.data.totalCount ?? items.length);
      } catch {
        if (isMounted) setError('Não foi possível carregar seus projetos.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadProjects();
    return () => { isMounted = false; };
  }, [filterParam, page]);

  const handleDelete = async () => {
    if (!deleteModal.projectId) return;
    setIsDeleting(true);
    setError('');
    try {
      await api.delete(`/projects/${deleteModal.projectId}`);
      setProjects((prev) => prev.filter((p) => p.publicId !== deleteModal.projectId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setDeleteModal({ show: false, projectId: null, projectTitle: '' });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Não foi possível excluir o projeto.';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/projects/${projectId}/edit`);
  };

  const confirmDelete = (projectId: string, projectTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ show: true, projectId, projectTitle });
  };

  const closeDeleteModal = () => setDeleteModal({ show: false, projectId: null, projectTitle: '' });

  return {
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
  };
};
