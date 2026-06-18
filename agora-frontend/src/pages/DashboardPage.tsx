import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import StatsCards from '@/features/dashboard/components/StatsCards';
import GradeChart from '@/features/dashboard/components/GradeChart';
import CriteriaChart from '@/features/dashboard/components/CriteriaChart';
import RecentProjectsList from '@/features/dashboard/components/RecentProjectsList';

const DashboardPage = () => {
  const { user } = useAuth();
  const { isLoading, error, recentProjects, lineChart, trend, criteriaBars, displayStats } =
    useDashboard();

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
