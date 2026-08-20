import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import type { PendingProject } from '../types';

type Props = { projects: PendingProject[] };

const PendingProjectsList = ({ projects }: Props) => (
  <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center gap-2 mb-4">
      <ClipboardList size={18} className="text-[#0a5c2f]" />
      <h2 className="text-base font-semibold text-gray-800">Projetos Aguardando sua Avaliação</h2>
    </div>

    {projects.length === 0 ? (
      <p className="text-sm text-gray-400 py-4 text-center">Nenhum projeto pendente nas suas áreas de ensino.</p>
    ) : (
      <div className="divide-y divide-gray-50">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="flex items-center gap-4 py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors group"
          >
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={20} className="text-[#0a5c2f]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#0a5c2f]">{p.title}</p>
              <p className="text-xs text-gray-500 truncate">{p.authorName} · {p.thematicAreaName}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {p.communityAverage != null ? (
                <span className="text-xs font-medium text-gray-600">
                  ★ {p.communityAverage.toFixed(1)} <span className="text-gray-400">({p.communityCount})</span>
                </span>
              ) : (
                <span className="text-xs text-gray-400">Sem notas</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default PendingProjectsList;
