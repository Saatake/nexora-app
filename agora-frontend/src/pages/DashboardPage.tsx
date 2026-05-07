import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Clock,
  Compass,
  Eye,
  FolderKanban,
  LayoutGrid,
  LineChart,
  LogOut,
  Search,
  Settings,
  Star,
  Trophy,
  User2
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

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
    Relatorio: 'Relatorio',
    ProjetoEscrito: 'Projeto escrito'
  };
  return lookup[category] ?? category;
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    { label: 'Relevancia', value: criteria.relevance, color: 'bg-[var(--agora-accent)]' },
    { label: 'Qualidade', value: criteria.quality, color: 'bg-sky-400' },
    { label: 'Metodo', value: criteria.methodology, color: 'bg-amber-400' },
    { label: 'Apresentacao', value: criteria.presentation, color: 'bg-emerald-400' },
    { label: 'Inovacao', value: criteria.innovation, color: 'bg-cyan-400' }
  ];

  const displayStats = stats ?? { projectCount: 0, averageGrade: 0, totalViews: 0 };
  const name = user?.name?.split(' ')[0] ?? 'Aluno';
  const initial = user?.name?.trim()?.charAt(0).toUpperCase() ?? 'A';

  const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, to: '/dashboard' },
    { label: 'Meus projetos', icon: FolderKanban, to: '#', disabled: true },
    { label: 'Explorar projetos', icon: Compass, to: '#', disabled: true },
    { label: 'Ranking', icon: Trophy, to: '#', disabled: true },
    { label: 'Perfil', icon: User2, to: '/profile' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen agora-shell text-[var(--agora-ink)]">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 flex-col justify-between bg-gradient-to-b from-[var(--agora-navy)] via-[var(--agora-navy-soft)] to-[#0a1224] text-white p-8">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="h-11 w-11 rounded-2xl bg-[var(--agora-accent)]/20 flex items-center justify-center text-[var(--agora-accent)] font-bold text-lg">A</div>
              <div>
                <p className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                  Agora
                </p>
                <p className="text-xs text-white/60">Academic workspace</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                if (item.to !== '#' && !item.disabled) {
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon size={18} />
                      {item.label}
                    </NavLink>
                  );
                }
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/40 cursor-not-allowed"
                  >
                    <Icon size={18} />
                    {item.label}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="space-y-2">
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5">
              <Settings size={18} />
              Configuracoes
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
            >
              <LogOut size={18} />
              Sair
            </button>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-semibold">
                {initial}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name ?? 'Aluno Nexora'}</p>
                <p className="text-xs text-white/50">{user?.course ?? 'Aluno'}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-6 py-8 lg:px-10">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-[var(--agora-muted)]">Bem-vindo, {name}</p>
              <h1
                className="text-3xl font-semibold text-[var(--agora-ink)]"
                style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
              >
                Dashboard
              </h1>
            </div>
            <div className="flex flex-1 items-center gap-3 lg:max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--agora-muted)]" />
                <input
                  type="text"
                  placeholder="Buscar projetos, alunos ou professores"
                  className="w-full rounded-2xl border border-[var(--agora-border)] bg-white/80 px-11 py-3 text-sm shadow-[var(--agora-shadow)]/30 outline-none transition focus:border-[var(--agora-accent)]"
                />
              </div>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--agora-border)] bg-white/80">
                <Bell size={18} className="text-[var(--agora-muted)]" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400"></span>
              </button>
              <Link
                to="/profile"
                className="hidden items-center gap-3 rounded-2xl border border-[var(--agora-border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--agora-ink)] lg:flex"
              >
                <div className="h-8 w-8 rounded-xl bg-[var(--agora-accent)]/15 text-[var(--agora-accent)] flex items-center justify-center font-semibold">
                  {initial}
                </div>
                {user?.name ?? 'Meu perfil'}
              </Link>
            </div>
          </header>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              {
                label: 'Projetos publicados',
                value: displayStats.projectCount,
                icon: FolderKanban,
                accent: 'text-[var(--agora-accent)]'
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
              return (
                <div
                  key={card.label}
                  className="dash-fade rounded-3xl border border-[var(--agora-border)] bg-white/90 p-5 shadow-[var(--agora-shadow)]"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--agora-accent)]/10">
                      <Icon className={card.accent} size={22} />
                    </div>
                    <span className="text-xs text-[var(--agora-muted)]">Atualizado agora</span>
                  </div>
                  <div className="mt-5">
                    <p className="text-3xl font-semibold text-[var(--agora-ink)]">{card.value}</p>
                    <p className="text-sm text-[var(--agora-muted)]">{card.label}</p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
            <div className="dash-fade rounded-3xl border border-[var(--agora-border)] bg-white/90 p-6 shadow-[var(--agora-shadow)]" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    Evolucao das notas
                  </h2>
                  <p className="text-sm text-[var(--agora-muted)]">Ultimos 7 meses</p>
                </div>
                {trend === null ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--agora-muted)]">
                    <LineChart size={16} />
                    Sem comparativo
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      trend >= 0 ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    <LineChart size={16} />
                    {trend >= 0 ? '+' : ''}
                    {trend.toFixed(1)}%
                  </div>
                )}
              </div>

              <div className="relative mt-6">
                <div className="pointer-events-none absolute inset-0 grid grid-rows-4 gap-0">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`grid-${index}`} className="border-t border-dashed border-slate-200"></div>
                  ))}
                </div>
                <svg viewBox={`0 0 ${lineChart.width} ${lineChart.height}`} className="h-56 w-full">
                  <defs>
                    <linearGradient id="gradeLine" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5a5" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#gradeLine)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={lineChart.points}
                  />
                  {lineChart.values.map((value, index) => {
                    const x = lineChart.paddingX + index * ((lineChart.width - lineChart.paddingX * 2) / (lineChart.labels.length - 1 || 1));
                    const y = lineChart.height - lineChart.paddingY - (value / Math.max(10, ...lineChart.values)) * (lineChart.height - lineChart.paddingY * 2);
                    return <circle key={`point-${index}`} cx={x} cy={y} r={5} fill="#ffffff" stroke="#0ea5a5" strokeWidth="2" />;
                  })}
                </svg>
              </div>

              <div className="mt-4 grid grid-cols-7 text-xs text-[var(--agora-muted)]">
                {lineChart.labels.map((label) => (
                  <div key={label} className="text-center">
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-fade rounded-3xl border border-[var(--agora-border)] bg-white/90 p-6 shadow-[var(--agora-shadow)]" style={{ animationDelay: '320ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                    Media por criterio
                  </h2>
                  <p className="text-sm text-[var(--agora-muted)]">Avaliacao geral dos projetos</p>
                </div>
                <BarChart3 size={18} className="text-[var(--agora-muted)]" />
              </div>

              <div className="mt-6 flex h-56 items-end gap-4">
                {criteriaBars.map((bar) => (
                  <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="text-xs font-semibold text-[var(--agora-ink)]">{bar.value.toFixed(1)}</div>
                    <div className="flex h-full w-full items-end">
                      <div
                        className={`w-full rounded-2xl ${bar.color}`}
                        style={{ height: `${Math.max(8, (bar.value / 10) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-[var(--agora-muted)]">{bar.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 dash-fade rounded-3xl border border-[var(--agora-border)] bg-white/90 p-6 shadow-[var(--agora-shadow)]" style={{ animationDelay: '440ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}>
                  Projetos recentes
                </h2>
                <p className="text-sm text-[var(--agora-muted)]">Ultimas publicacoes do seu portfolio</p>
              </div>
              <button className="text-sm font-semibold text-[var(--agora-accent)]">Ver todos</button>
            </div>

            <div className="mt-5 space-y-4">
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="h-16 rounded-2xl bg-slate-100 animate-pulse"></div>
                  ))}
                </div>
              )}

              {!isLoading && recentProjects.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-[var(--agora-muted)]">
                  Nenhum projeto publicado ainda.
                </div>
              )}

              {!isLoading && recentProjects.length > 0 &&
                recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--agora-border)] bg-white px-4 py-4 shadow-sm transition hover:shadow-md lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[var(--agora-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--agora-accent)]">
                          {formatCategory(project.category)}
                        </span>
                        <span className="text-xs text-[var(--agora-muted)] flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(project.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-base font-semibold text-[var(--agora-ink)]">{project.title}</p>
                      <p className="text-sm text-[var(--agora-muted)] line-clamp-1 max-w-xl">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-[var(--agora-ink)]">
                          {project.averageGrade?.toFixed(1) ?? '--'}
                        </p>
                        <p className="text-xs text-[var(--agora-muted)]">Media</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-[var(--agora-ink)]">
                          {new Intl.NumberFormat('pt-BR').format(project.viewCount)}
                        </p>
                        <p className="text-xs text-[var(--agora-muted)]">Views</p>
                      </div>
                      <button className="flex items-center gap-2 rounded-xl border border-[var(--agora-border)] px-3 py-2 text-sm font-semibold text-[var(--agora-ink)]">
                        Abrir
                        <Star size={14} className="text-amber-500" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
