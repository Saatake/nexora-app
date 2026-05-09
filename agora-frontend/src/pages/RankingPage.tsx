import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Star, TrendingUp, Users } from 'lucide-react';
import api from '../api/axios';
import AppShell from '../components/AppShell';

type RankingProject = {
  position: number;
  projectId: number;
  title: string;
  authorName: string;
  averageGrade: number;
  viewCount: number;
};

type RankingStudent = {
  position: number;
  studentId: string;
  name: string;
  course: string;
  averageGrade: number;
  projectCount: number;
};

type GeneralStats = {
  totalProjects: number;
  generalAverage: number;
  totalViews: number;
  totalStudents: number;
};

const formatViews = (count: number): string => {
  if (count >= 1000) return `${Math.floor(count / 1000)}k+`;
  return count.toString();
};

const RankingPage = () => {
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
          api.get<GeneralStats>('/stats/general')
        ]);

        if (!isMounted) return;

        setTopProjects(projectsResponse.data);
        setTopStudents(studentsResponse.data);
        setStats(statsResponse.data);
      } catch (err) {
        if (isMounted) {
          setError('Não foi possível carregar os dados do ranking.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRanking();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <AppShell title="Ranking Ágora" subtitle="Celebre a excelência acadêmica da nossa comunidade">
        <div className="mt-8 text-center text-[var(--agora-muted)]">Carregando...</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Ranking Ágora" subtitle="Celebre a excelência acadêmica da nossa comunidade">
        <div className="mt-8 text-center text-red-500">{error}</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Ranking Ágora" subtitle="Celebre a excelência acadêmica da nossa comunidade">
      <div className="mt-8 space-y-8">
        {/* Top 10 Projetos do Semestre */}
        <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Star className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Top 10 Projetos do Semestre</h2>
              <p className="text-sm text-slate-500">Os trabalhos mais bem avaliados de 2024</p>
            </div>
          </div>

          <div className="space-y-4">
            {topProjects.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Nenhum projeto avaliado ainda</p>
            ) : (
              topProjects.map((project) => (
                <Link
                  key={project.projectId}
                  to={`/projects/${project.projectId}`}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {project.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{project.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span>{project.authorName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{project.viewCount} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
                    <Star className="w-5 h-5 fill-emerald-600" />
                    <span>{project.averageGrade.toFixed(1)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 5 Alunos */}
          <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Top 5 Alunos</h2>
                <p className="text-sm text-slate-500">Maiores médias gerais</p>
              </div>
            </div>

            <div className="space-y-4">
              {topStudents.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Nenhum aluno avaliado ainda</p>
              ) : (
                topStudents.slice(0, 5).map((student) => (
                  <Link
                    key={student.studentId}
                    to={`/profile/${student.studentId}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {student.position}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{student.name}</h3>
                      <p className="text-sm text-slate-500">{student.course}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{student.projectCount} projetos</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                      <Star className="w-4 h-4 fill-emerald-600" />
                      <span>{student.averageGrade.toFixed(1)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Estatísticas Gerais */}
        {stats && (
          <section className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 p-8 text-white shadow-lg">

            <div className="text-center mb-8 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Estatísticas Gerais</h2>
              <p className="text-purple-100 mt-2">Panorama da plataforma em 2026</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{stats.totalProjects}</div>
                <div className="text-purple-100">Projetos Publicados</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{stats.generalAverage.toFixed(1)}</div>
                <div className="text-purple-100">Média Geral</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{formatViews(stats.totalViews)}</div>
                <div className="text-purple-100">Visualizações</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{stats.totalStudents}</div>
                <div className="text-purple-100">Participantes Ativos</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default RankingPage;
