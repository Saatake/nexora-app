import { Link } from 'react-router-dom';
import { Crown, Eye, Star, TrendingUp, Users } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useRanking, medalColors } from '@/features/ranking/hooks/useRanking';

const RankingPage = () => {
  const { topProjects, topStudents, stats, isLoading, error, formatViews } = useRanking();

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
    <AppShell title="Ranking Ágora" subtitle="Celebre a excelência acadêmica da nossa comunidade" showSearch={false}>
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Projetos', value: stats?.totalProjects ?? 0, icon: TrendingUp },
          { label: 'Média geral', value: stats?.generalAverage?.toFixed(1) ?? '0.0', icon: Star },
          { label: 'Visualizações', value: formatViews(stats?.totalViews ?? 0), icon: Eye },
          { label: 'Estudantes', value: stats?.totalStudents ?? 0, icon: Users },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-4 shadow-[var(--agora-shadow)] text-center">
              <Icon size={20} className="mx-auto mb-2 text-[#0a5c2f]" />
              <p className="text-xl font-bold text-[var(--agora-ink)]">{item.value}</p>
              <p className="text-xs text-[var(--agora-muted)]">{item.label}</p>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--agora-border)] flex items-center gap-2">
            <Crown size={18} className="text-[#0a5c2f]" />
            <h2 className="font-bold text-[var(--agora-ink)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Melhores projetos</h2>
          </div>
          {topProjects.length === 0 ? (
            <p className="text-center text-[var(--agora-muted)] py-8">Nenhum projeto avaliado ainda</p>
          ) : (
            topProjects.map((project, index) => (
              <Link
                key={project.projectId}
                to={`/projects/${project.projectId}`}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-[var(--agora-accent-bg)] transition-colors ${index < topProjects.length - 1 ? 'border-b border-[var(--agora-border)]' : ''}`}
              >
                <span className={`text-lg font-bold w-6 text-center flex-shrink-0 ${medalColors[index] ?? 'text-[var(--agora-muted)]'}`}>
                  {project.position <= 3 ? '●' : project.position}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--agora-ink)] truncate">{project.title}</p>
                  <p className="text-xs text-[var(--agora-muted)]">{project.authorName}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--agora-muted)]">
                  <span className="inline-flex items-center gap-1"><Eye size={12} />{project.viewCount}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500 flex-shrink-0">
                  <Star size={13} fill="currentColor" />
                  {project.averageGrade.toFixed(1)}
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--agora-border)] flex items-center gap-2">
            <Users size={18} className="text-[#0a5c2f]" />
            <h2 className="font-bold text-[var(--agora-ink)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Melhores alunos</h2>
          </div>
          {topStudents.length === 0 ? (
            <p className="text-center text-[var(--agora-muted)] py-8">Nenhum aluno avaliado ainda</p>
          ) : (
            topStudents.map((student, index) => (
              <Link
                key={student.studentId}
                to={`/profile/${student.studentId}`}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-[var(--agora-accent-bg)] transition-colors ${index < topStudents.length - 1 ? 'border-b border-[var(--agora-border)]' : ''}`}
              >
                <span className={`text-lg font-bold w-6 text-center flex-shrink-0 ${medalColors[index] ?? 'text-[var(--agora-muted)]'}`}>
                  {student.position <= 3 ? '●' : student.position}
                </span>
                <div className="h-8 w-8 rounded bg-[#0a5c2f] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  { student.profilePictureUrl ? <img src={student.profilePictureUrl} alt={student.name} className="h-full w-full object-cover rounded" /> : student.name.charAt(0).toUpperCase() }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--agora-ink)] truncate">{student.name}</p>
                  <p className="text-xs text-[var(--agora-muted)] truncate">{student.course}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#0a5c2f]">{student.averageGrade.toFixed(1)}</p>
                  <p className="text-xs text-[var(--agora-muted)]">{student.projectCount} proj.</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default RankingPage;
