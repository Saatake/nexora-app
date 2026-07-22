import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { formatCategory, formatDate } from '@/shared/utils/formatters';

export type FilterKey = 'all' | 'Tcc' | 'Upx' | 'IniciacaoCientifica' | 'Relatorio' | 'ProjetoEscrito';

export type Project = {
  id: number;
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

export const useMyProjects = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    projectId: number | null;
    projectTitle: string;
  }>({ show: false, projectId: null, projectTitle: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const filterParam = useMemo(() => (activeFilter === 'all' ? undefined : activeFilter), [activeFilter]);

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get<PagedResponse<Project>>('/projects/me', {
          params: { page: 1, pageSize: 12, type: filterParam },
        });
        if (!isMounted) return;
        setProjects(response.data.items ?? []);
      } catch {
        if (isMounted) setError('Nao foi possivel carregar seus projetos.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadProjects();
    return () => { isMounted = false; };
  }, [filterParam]);

  const handleDelete = async () => {
    if (!deleteModal.projectId) return;
    setIsDeleting(true);
    setError('');
    try {
      await api.delete(`/projects/${deleteModal.projectId}`);
      setProjects(projects.filter((p) => p.id !== deleteModal.projectId));
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

  const closeDeleteModal = () => setDeleteModal({ show: false, projectId: null, projectTitle: '' });

  return {
    activeFilter,
    setActiveFilter,
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
