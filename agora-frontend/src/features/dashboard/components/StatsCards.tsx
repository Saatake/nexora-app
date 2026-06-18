import { Link } from 'react-router-dom';
import { BarChart3, Eye, FolderKanban, Star } from 'lucide-react';
import type { DashboardStats } from '../types';

type StatsCardsProps = {
  stats: DashboardStats;
};

const StatsCards = ({ stats }: StatsCardsProps) => (
  <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[
      {
        label: 'Projetos publicados',
        value: stats.projectCount,
        icon: FolderKanban,
        to: '/projects',
      },
      {
        label: 'Media geral',
        value: stats.averageGrade.toFixed(1),
        icon: Star,
      },
      {
        label: 'Visualizacoes totais',
        value: new Intl.NumberFormat('pt-BR').format(stats.totalViews),
        icon: Eye,
      },
    ].map((card, index) => {
      const Icon = card.icon;
      const content = (
        <div
          className="dash-fade bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl p-5 shadow-[var(--agora-shadow)]"
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
);

export default StatsCards;
