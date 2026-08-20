import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import type { FeaturedProject } from '../types';
import { BADGE_LABELS, BADGE_COLORS } from '@/constants/badges';

type Props = { projects: FeaturedProject[] };

const FeaturedProjectsList = ({ projects }: Props) => (
  <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center gap-2 mb-4">
      <Trophy size={18} className="text-yellow-500" />
      <h2 className="text-base font-semibold text-gray-800">Projetos em Destaque</h2>
    </div>

    {projects.length === 0 ? (
      <p className="text-sm text-gray-400 py-4 text-center">Nenhum projeto avaliado ainda.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p, i) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow group flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
              {p.averageGrade != null && (
                <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                  ★ {p.averageGrade.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0a5c2f] leading-snug">{p.title}</p>
            <p className="text-xs text-gray-500">{p.authorName} · {p.evaluationCount} avaliações</p>
            {p.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {p.badges.map((b) => (
                  <span
                    key={b.badge}
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BADGE_COLORS[b.badge] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {BADGE_LABELS[b.badge] ?? b.badge}{b.count > 1 && <span className="ml-1 opacity-70">×{b.count}</span>}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default FeaturedProjectsList;
