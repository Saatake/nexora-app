import { useEffect, useMemo, useState } from 'react';
import api from '@/api/axios';
import { formatMonth, getRecentMonths } from '@/shared/utils/formatters';
import type {
  DashboardStats,
  DashboardCharts,
  DashboardProject,
  PagedResponse,
} from '../types';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [recentProjects, setRecentProjects] = useState<DashboardProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [statsResponse, chartsResponse, recentResponse] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/charts'),
          api.get<PagedResponse<DashboardProject>>('/projects/me', {
            params: { page: 1, pageSize: 5 },
          }),
        ]);
        if (!isMounted) return;
        const items = recentResponse.data.items ?? [];
        const sorted = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setStats(statsResponse.data);
        setCharts(chartsResponse.data);
        setRecentProjects(sorted);
      } catch {
        if (isMounted) setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const lineChart = useMemo(() => {
    const series = charts?.gradeEvolution?.slice(-7) ?? [];
    const labels = series.length ? series.map((item) => formatMonth(item.month)) : getRecentMonths(7);
    const values = series.length ? series.map((item) => item.average) : labels.map(() => 0);

    const width = 620;
    const height = 220;
    const paddingX = 26;
    const paddingY = 24;
    const maxValue = Math.max(10, ...values);
    const range = maxValue || 10;
    const step = labels.length > 1 ? (width - paddingX * 2) / (labels.length - 1) : 0;

    const points = values
      .map((value, index) => {
        const x = paddingX + index * step;
        const y = height - paddingY - (value / range) * (height - paddingY * 2);
        return `${x},${y}`;
      })
      .join(' ');

    return { labels, values, width, height, paddingX, paddingY, points };
  }, [charts]);

  const trend = useMemo(() => {
    const series = charts?.gradeEvolution?.slice(-7) ?? [];
    if (series.length < 2) return null;
    const first = series[0].average;
    const last = series[series.length - 1].average;
    if (!first) return null;
    return ((last - first) / first) * 100;
  }, [charts]);

  const criteria = charts?.criteriaAverage ?? {
    relevance: 0,
    quality: 0,
    methodology: 0,
    presentation: 0,
    innovation: 0,
  };

  const criteriaBars = [
    { label: 'Relevância', value: criteria.relevance, color: '#0a5c2f' },
    { label: 'Qualidade', value: criteria.quality, color: '#18915b' },
    { label: 'Metodologia', value: criteria.methodology, color: '#34d399' },
    { label: 'Apresentação', value: criteria.presentation, color: '#6ee7b7' },
    { label: 'Inovação', value: criteria.innovation, color: '#a7f3d0' },
  ];

  const displayStats = stats ?? { projectCount: 0, averageGrade: 0, totalViews: 0 };

  return {
    isLoading,
    error,
    recentProjects,
    lineChart,
    trend,
    criteriaBars,
    displayStats,
  };
};
