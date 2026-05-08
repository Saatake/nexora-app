import React from 'react';
import AppShell from '../components/AppShell';

const ExploreProjectsPage = () => {
  return (
    <AppShell title="Explorar Projetos" subtitle="Descubra projetos publicados na plataforma">
      <div className="mt-8 rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-[var(--agora-muted)]">
        Em breve: feed publico com filtros, busca e detalhes completos dos projetos.
      </div>
    </AppShell>
  );
};

export default ExploreProjectsPage;
