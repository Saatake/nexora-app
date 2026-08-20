import { useEffect, useState } from 'react';
import api from '@/api/axios';
import type { ProfessorDashboard } from '../types';

export const useProfessorDashboard = () => {
  const [data, setData] = useState<ProfessorDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await api.get<ProfessorDashboard>('/dashboard/professor');
        if (isMounted) setData(res.data);
      } catch {
        if (isMounted) setError('Não foi possível carregar o dashboard.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return { data, isLoading, error };
};
