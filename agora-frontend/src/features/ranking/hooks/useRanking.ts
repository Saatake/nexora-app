import { useEffect, useState } from 'react';
import api from '@/api/axios';
import { formatViews } from '@/shared/utils/formatters';

export type RankingProject = {
  position: number;
  projectId: number;
  title: string;
  authorName: string;
  averageGrade: number;
  viewCount: number;
};

export type RankingStudent = {
  position: number;
  studentId: string;
  name: string;
  course: string;
  averageGrade: number;
  projectCount: number;
  profilePictureUrl: string;
};

export type GeneralStats = {
  totalProjects: number;
  generalAverage: number;
  totalViews: number;
  totalStudents: number;
};

export const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

export const useRanking = () => {
  const [topProjects, setTopProjects] = useState<RankingProject[]>([]);
  const [topStudents, setTopStudents] = useState<RankingStudent[]>([]);
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadRanking = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [projectsResponse, studentsResponse, statsResponse] = await Promise.all([
          api.get<RankingProject[]>('/ranking/projects'),
          api.get<RankingStudent[]>('/ranking/students'),
          api.get<GeneralStats>('/stats/general'),
        ]);
        if (!isMounted) return;
        setTopProjects(projectsResponse.data);
        setTopStudents(studentsResponse.data);
        setStats(statsResponse.data);
      } catch {
        if (isMounted) setError('Não foi possível carregar os dados do ranking.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadRanking();
    return () => { isMounted = false; };
  }, []);

  return { topProjects, topStudents, stats, isLoading, error, formatViews };
};
