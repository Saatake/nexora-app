import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  Eye,
  FolderKanban,
  LineChart,
  Plus,
  Star,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';

type DashboardStats = {
  projectCount: number;
  averageGrade: number;
  totalViews: number;
};

type GradeEvolution = {
  month: string;
  average: number;
};

type CriteriaAverage = {
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
};

type DashboardCharts = {
  gradeEvolution: GradeEvolution[];
  criteriaAverage: CriteriaAverage;
};

type Project = {
  id: number;
  title: string;
  description: string;
  category: string;
  averageGrade?: number | null;
  viewCount: number;
  createdAt: string;
};

type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatMonth = (value: string) => {
  const parts = value.split('-').map((item) => Number(item));
  const month = parts[1];
  if (!month || month < 1 || month > 12) return value;
  return monthNames[month - 1];
};

const getRecentMonths = (count: number) => {
  const today = new Date();
  const labels: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    labels.push(monthNames[date.getMonth()]);
  }
  return labels;
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Data desconhecida';
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const formatCategory = (category: string) => {
  const lookup: Record<string, string> = {
    Tcc: 'TCC',
    Upx: 'UPX',
    IniciacaoCientifica: 'Iniciacao Cientifica',
    Relatorio: 'Relatorio',
    ProjetoEscrito: 'Projeto escrito'
  };
  return lookup[category] ?? category;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
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
          api.get<PagedResponse<Project>>('/projects/me', { params: { page: 1, pageSize: 5 } })
        ]);

        if (!isMounted) return;

        const items = recentResponse.data.items ?? [];
        const sorted = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setStats(statsResponse.data);
        setCharts(chartsResponse.data);
        setRecentProjects(sorted);
      } catch (err) {
        if (isMounted) {
          setError('Nao foi possivel carregar os dados do dashboard.');
        }
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
    innovation: 0
  };

  const criteriaBars = [
    { label: 'Relevancia', value: criteria.relevance, color: '#0a5c2f' },
    { label: 'Qualidade', value: criteria.quality, color: '#18915b' },
    { label: 'Metodo', value: criteria.methodology, color: '#34d399' },
    { label: 'Apresentacao', value: criteria.presentation, color: '#6ee7b7' },
    { label: 'Inovacao', value: criteria.innovation, color: '#a7f3d0' }
  ];

  const displayStats = stats ?? { projectCount: 0, averageGrade: 0, totalViews: 0 };
  const name = user?.name?.split(' ')[0] ?? 'Aluno';

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Bem-vindo de volta, ${name}`}
      headerActions={
        <Link
          to="/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a5c2f] hover:bg-[#084925] text-white text-sm font-semibold rounded transition-colors"
        >
          <Plus size={16} />
          Novo projeto
        </Link>
      }
    >
      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Projetos publicados',
            value: displayStats.projectCount,
            icon: FolderKanban,
            accent: 'text-[var(--agora-accent)]',
            to: '/projects'
          },
          {
            label: 'Media geral',
            value: displayStats.averageGrade.toFixed(1),
            icon: Star,
            accent: 'text-amber-500'
          },
          {
            label: 'Visualizacoes totais',
            value: new Intl.NumberFormat('pt-BR').format(displayStats.totalViews),
            icon: Eye,
            accent: 'text-sky-500'
          }
        ].map((card, index) => {
          const Icon = card.icon;
          const content = (
            <div
              className="dash-fade bg-white border border-[var(--agora-border)] rounded-xl p-5 shadow-[var(--agora-shadow)]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded bg-[var(--agora-accent-bg)] flex items-center justify-center">
                  <Icon size={20} className="text-[#0a5c2f]" />
                </div>
                <BarChart3 size={14} className="text-[var(--agora-muted)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--agora-ink)]">{card.value}</p>
              <p className="text-sm text-[var(--agora-muted)] mt-0.5">{card.label}</p>
            </div>
          );

          return card.to ? (
            <Link key={card.label} to={card.to} className="focus:outline-none">
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </section>

      <section className="mt-6 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <div className="dash-fade bg-white border border-[var(--agora-border)] rounded-xl p-6 shadow-[var(--agora-shadow)]" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-[var(--agora-ink)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Evolucao das notas</h2>
              <p className="text-xs text-[var(--agora-muted)]">Ultimos 7 meses</p>
            </div>
            {trend === null ? (
              <div className="flex items-center gap-1 text-xs text-[var(--agora-muted)] font-medium">
                <LineChart size={14} />
                Sem comparativo
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <LineChart size={14} />
                {trend >= 0 ? '+' : ''}
                {trend.toFixed(1)}%
              </div>
            )}
          </div>
          <div className="relative">
            {lineChart.values.every(v => v === 0) ? (
              <div className="h-40 flex items-center justify-center text-sm text-slate-400">
                Ainda nao ha dados de evolucao de notas
              </div>
            ) : (
              <svg viewBox={`0 0 ${lineChart.width} ${lineChart.height}`} className="w-full h-40">
                <defs>
                  <linearGradient id="greenGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#0a5c2f" />
                    <stop offset="100%" stopColor="#18915b" />
                  </linearGradient>
                </defs>
                {Array.from({ length: 4 }).map((_, i) => (
                  <line
                    key={`grid-${i}`}
                    x1={lineChart.paddingX}
                    x2={lineChart.width - lineChart.paddingX}
                    y1={lineChart.paddingY + (i * (lineChart.height - lineChart.paddingY * 2)) / 3}
                    y2={lineChart.paddingY + (i * (lineChart.height - lineChart.paddingY * 2)) / 3}
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                ))}
                <polyline fill="none" stroke="url(#greenGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={lineChart.points} />
                {lineChart.values.map((value, index) => {
                  const x = lineChart.paddingX + index * ((lineChart.width - lineChart.paddingX * 2) / (lineChart.labels.length - 1 || 1));
                  const y = lineChart.height - lineChart.paddingY - (value / Math.max(10, ...lineChart.values)) * (lineChart.height - lineChart.paddingY * 2);
                  return <circle key={`point-${index}`} cx={x} cy={y} r={4} fill="#0a5c2f" />;
                })}
              </svg>
            )}
            <div className="flex justify-between px-6 mt-1">
              {lineChart.labels.map(label => (
                <span key={label} className="text-xs text-[var(--agora-muted)]">{label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-fade bg-white border border-[var(--agora-border)] rounded-xl p-6 shadow-[var(--agora-shadow)]" style={{ animationDelay: '300ms' }}>
          <h2 className="font-bold text-[var(--agora-ink)] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Media por criterio</h2>
          <div className="space-y-3">
            {criteriaBars.every(bar => bar.value === 0) ? (
              <div className="text-sm text-slate-400">Ainda nao ha avaliacoes por criterio</div>
            ) : (
              criteriaBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--agora-muted)]">{bar.label}</span>
                    <span className="font-semibold text-[var(--agora-ink)]">{bar.value.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(bar.value / 10) * 100}%`, backgroundColor: bar.color }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[var(--agora-ink)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Projetos recentes</h2>
          <Link to="/projects" className="text-sm text-[#0a5c2f] hover:underline font-medium">Ver todos</Link>
        </div>
        <div className="bg-white border border-[var(--agora-border)] rounded-xl overflow-hidden shadow-[var(--agora-shadow)]">
          <div className="mt-5 space-y-4">
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
                  ))}
                </div>
              )}

              {!isLoading && recentProjects.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-[var(--agora-muted)]">
                  Nenhum projeto publicado ainda.
                </div>
              )}

              {!isLoading && recentProjects.length > 0 &&
                recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[var(--agora-accent-bg)] transition-colors border-b border-[var(--agora-border)] last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-green-100 text-[#0a5c2f]">
                        {formatCategory(project.category)}
                      </span>
                      <span className="font-medium text-[var(--agora-ink)] text-sm">{project.title}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-[var(--agora-muted)]">
                      <span className="flex items-center gap-1"><Star size={13} className="text-amber-400" />{project.averageGrade?.toFixed(1) ?? '--'}</span>
                      <span className="flex items-center gap-1"><Eye size={13} />{new Intl.NumberFormat('pt-BR').format(project.viewCount)}</span>
                      <span className="hidden sm:block">{formatDate(project.createdAt)}</span>
                    </div>
                  </Link>
                ))}
            </div>
        </div>
      </section>
    </AppShell>
  );
};

export default DashboardPage;
