import AppShell from '../components/AppShell';

const ProfilePage = () => {
  return (
    <AppShell title="Perfil" subtitle="Gerencie suas informacoes pessoais">
      <div className="mt-8 rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-[var(--agora-muted)]">
        Em breve: edicao de perfil, curso e dados pessoais.
      </div>
    </AppShell>
  );
};

export default ProfilePage;
