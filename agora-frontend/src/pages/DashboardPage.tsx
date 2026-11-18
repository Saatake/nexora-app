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

const StudentDashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded bg-[var(--agora-border)]/70" />
            <div className="h-4 w-4 rounded bg-[var(--agora-border)]/50" />
          </div>
          <div className="h-7 w-16 rounded bg-[var(--agora-border)]/70" />
          <div className="h-4 w-28 rounded bg-[var(--agora-border)]/50" />
        </div>
      ))}
    </section>

    <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
      <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-[var(--agora-border)]/70" />
        <div className="h-48 w-full rounded-lg bg-[var(--agora-border)]/40" />
      </div>
      <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-6 space-y-4">
        <div className="h-5 w-44 rounded bg-[var(--agora-border)]/70" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-[var(--agora-border)]/60" />
              <div className="h-3 w-full rounded-full bg-[var(--agora-border)]/40" />
            </div>
          ))}
        </div>
      </div>
    </section>

    <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-6 space-y-3">
      <div className="h-5 w-36 rounded bg-[var(--agora-border)]/70" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-[var(--agora-border)]/40" />
      ))}
    </div>
  </div>
);

const ProfessorDashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-5 space-y-3"
        >
          <div className="h-10 w-10 rounded bg-[var(--agora-border)]/70" />
          <div className="h-7 w-16 rounded bg-[var(--agora-border)]/70" />
          <div className="h-4 w-32 rounded bg-[var(--agora-border)]/50" />
        </div>
      ))}
    </section>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, col) => (
        <div
          key={col}
          className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-6 space-y-3"
        >
          <div className="h-5 w-44 rounded bg-[var(--agora-border)]/70 mb-2" />
          {Array.from({ length: 4 }).map((_, row) => (
            <div key={row} className="h-16 rounded-xl bg-[var(--agora-border)]/40" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const isProfessor = user?.roleType === 'Professor';

  const studentDash = useDashboard(!isProfessor);
  const professorDash = useProfessorDashboard(isProfessor);

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
        {isLoading && <ProfessorDashboardSkeleton />}
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

      {isLoading ? (
        <StudentDashboardSkeleton />
      ) : (
        <>
          <StatsCards stats={displayStats} />

          <section className="mt-6 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
            <GradeChart lineChart={lineChart} trend={trend} />
            <CriteriaChart criteriaBars={criteriaBars} />
          </section>

          <RecentProjectsList projects={recentProjects} isLoading={isLoading} />
        </>
      )}
    </AppShell>
  );
};

export default DashboardPage;
