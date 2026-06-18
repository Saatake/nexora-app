import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/api/axios';
import { formatCategory } from '@/shared/utils/formatters';

export type Project = {
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

export type Student = {
  id: string;
  name: string;
  course: string;
  bio: string;
  photoUrl?: string | null;
  interests?: string | null;
  roleType: string;
};

export const useExplore = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('search') ?? undefined;
  const tab = searchParams.get('tab') ?? 'projects';

  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoadingProjects(true);
      setError('');
      try {
        const response = await api.get('/projects', { params: { search: q, page: 1, pageSize: 24 } });
        if (!isMounted) return;
        setProjects(response.data.items ?? response.data ?? []);
      } catch {
        if (isMounted) setError('Não foi possível carregar projetos.');
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [q]);

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

  return { tab, projects, students, isLoadingProjects, isLoadingStudents, error, switchTab, formatCategory };
};
