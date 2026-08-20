import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useProfessorDashboard } from '@/features/dashboard/hooks/useProfessorDashboard';
import StatsCards from '@/features/dashboard/components/StatsCards';
import GradeChart from '@/features/dashboard/components/GradeChart';
import CriteriaChart from '@/features/dashboard/components/CriteriaChart';
import RecentProjectsList from '@/features/dashboard/components/RecentProjectsList';
import ProfessorStatsCards from '@/features/dashboard/components/ProfessorStatsCards';
import PendingProjectsList from '@/features/dashboard/components/PendingProjectsList';
import FeaturedProjectsList from '@/features/dashboard/components/FeaturedProjectsList';

const DashboardPage = () => {
  const { user } = useAuth();
  const isProfessor = user?.roleType === 'Professor';

  const studentDash = useDashboard();
  const professorDash = useProfessorDashboard();

  const name = user?.name?.split(' ')[0] ?? 'Usuário';

  if (isProfessor) {
    const { data, isLoading, error } = professorDash;
    return (
      <AppShell title="Dashboard" subtitle={`Bem-vindo de volta, Prof. ${name}`}>
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {!isLoading && data && (
          <>
            <ProfessorStatsCards
              evaluationsGiven={data.evaluationsGiven}
              areasCount={data.areasCount}
              pendingCount={data.pendingCount}
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PendingProjectsList projects={data.pendingProjects} />
              <FeaturedProjectsList projects={data.featuredProjects} />
            </div>
          </>
        )}
        {isLoading && (
          <div className="mt-10 text-center text-sm text-gray-400">Carregando dashboard...</div>
        )}
      </AppShell>
    );
  }

  const { isLoading, error, recentProjects, lineChart, trend, criteriaBars, displayStats } = studentDash;

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

      <StatsCards stats={displayStats} />

      <section className="mt-6 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <GradeChart lineChart={lineChart} trend={trend} />
        <CriteriaChart criteriaBars={criteriaBars} />
      </section>

      <RecentProjectsList projects={recentProjects} isLoading={isLoading} />
    </AppShell>
  );
};

export default DashboardPage;
