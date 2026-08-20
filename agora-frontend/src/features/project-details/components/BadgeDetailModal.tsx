import type { ProjectBadge } from '../types';
import { BADGE_LABELS, BADGE_COLORS } from '@/constants/badges';

type Props = {
  badge: ProjectBadge;
  onClose: () => void;
};

const BadgeDetailModal = ({ badge, onClose }: Props) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div
      className="bg-[var(--agora-panel)] rounded-xl p-6 max-w-sm w-full shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-sm px-3 py-1 rounded-full border font-semibold ${BADGE_COLORS[badge.badge] ?? 'bg-gray-100 text-gray-600'}`}>
          {BADGE_LABELS[badge.badge] ?? badge.badge}
        </span>
        <button onClick={onClose} className="text-[var(--agora-muted)] hover:text-[var(--agora-ink)] text-lg leading-none">✕</button>
      </div>

      <p className="text-xs text-[var(--agora-muted)] mb-3">
        {badge.count} professor{badge.count !== 1 ? 'es' : ''} concedeu esse badge
      </p>

      <div className="space-y-2">
        {badge.professors.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--agora-border)] last:border-0">
            <span className="text-sm font-medium text-[var(--agora-ink)]">{p.name}</span>
            <span className="text-xs text-[var(--agora-muted)]">
              {new Date(p.awardedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default BadgeDetailModal;
