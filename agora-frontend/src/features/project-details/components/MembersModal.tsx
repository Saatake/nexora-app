import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { Project } from '../types';

type MembersModalProps = {
  project: Project;
  onClose: () => void;
};

const MembersModal = ({ project, onClose }: MembersModalProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-sm rounded-2xl bg-[var(--agora-panel)] shadow-xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--agora-border)]">
        <h3 className="text-base font-bold text-[var(--agora-ink)]">Membros do projeto</h3>
        <button
          onClick={onClose}
          className="text-[var(--agora-muted)] hover:text-[var(--agora-ink)] transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        <Link
          to={`/profile/${project.authorId}`}
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--agora-accent-bg)] transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-[#0a5c2f] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
            {project.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--agora-ink)] truncate">
              {project.authorName}
            </p>
            {project.course && (
              <p className="text-xs text-[var(--agora-muted)] truncate">{project.course}</p>
            )}
            <span className="text-xs text-[var(--agora-accent)] font-medium">Autor</span>
          </div>
        </Link>

        {project.collaborators?.map((c) => (
          <Link
            key={c.id}
            to={`/profile/${c.id}`}
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--agora-accent-bg)] transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
              {c.photoUrl ? (
                <img src={c.photoUrl} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                c.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--agora-ink)] truncate">{c.name}</p>
              {c.course && (
                <p className="text-xs text-[var(--agora-muted)] truncate">{c.course}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default MembersModal;
