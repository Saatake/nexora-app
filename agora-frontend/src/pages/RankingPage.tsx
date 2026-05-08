import AppShell from '../components/AppShell';

const RankingPage = () => {
  return (
    <AppShell title="Ranking" subtitle="Veja os destaques da comunidade">
      <div className="mt-8 rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-[var(--agora-muted)]">
        Em breve: ranking de projetos e estudantes.
      </div>
    </AppShell>
  );
};

export default RankingPage;
