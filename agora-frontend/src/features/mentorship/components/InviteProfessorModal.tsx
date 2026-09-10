import { useState, useEffect } from 'react';
import { Search, X, GraduationCap, Check } from 'lucide-react';
import api from '@/api/axios';

type ProfessorItem = {
  id: string;
  name: string;
  photoUrl?: string | null;
  course?: string | null;
  roleType: string;
};

type InviteProfessorModalProps = {
  onClose: () => void;
  onInvite: (professorId: string, message?: string) => Promise<{ success: boolean; error?: string }>;
};

export const InviteProfessorModal = ({ onClose, onInvite }: InviteProfessorModalProps) => {
  const [query, setQuery] = useState('');
  const [professors, setProfessors] = useState<ProfessorItem[]>([]);
  const [selectedProf, setSelectedProf] = useState<ProfessorItem | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const search = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<{ items: ProfessorItem[] }>(`/users?search=${encodeURIComponent(query)}&page=1&pageSize=20`);
        // Filtra apenas docentes
        const profs = (res.data.items || []).filter((u) => u.roleType === 'Professor');
        setProfessors(profs);
      } catch {
        // silencia
      } finally {
        setIsLoading(false);
      }
    };

    const delay = setTimeout(search, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProf) {
      setError('Selecione um professor para convidar.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const res = await onInvite(selectedProf.id, message);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Erro ao enviar convite.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--agora-muted)] hover:text-[var(--agora-ink)] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[#0a5c2f]/10 text-[#0a5c2f]">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--agora-ink)]">Convidar Professor Orientador</h2>
            <p className="text-xs text-[var(--agora-muted)]">
              Escolha um docente da instituição para orientar e mentorar seu projeto acadêmico.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
              Buscar Professor
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--agora-muted)]" size={16} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nome ou curso do professor..."
                className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] pl-9 pr-4 py-2 text-sm text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)]"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[var(--agora-border)] rounded-xl p-2 bg-[var(--agora-card-bg)]">
            {isLoading && (
              <p className="py-4 text-center text-xs text-[var(--agora-muted)]">Buscando professores...</p>
            )}
            {!isLoading && professors.length === 0 && (
              <p className="py-4 text-center text-xs text-[var(--agora-muted)]">Nenhum professor encontrado.</p>
            )}
            {professors.map((prof) => (
              <div
                key={prof.id}
                onClick={() => setSelectedProf(prof)}
                className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                  selectedProf?.id === prof.id
                    ? 'bg-[#0a5c2f]/15 border border-[#0a5c2f]/40 text-[var(--agora-ink)]'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--agora-ink)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {prof.photoUrl ? (
                    <img src={prof.photoUrl} alt={prof.name} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#0a5c2f] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {prof.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{prof.name}</p>
                    <p className="text-[11px] text-[var(--agora-muted)] truncate">{prof.course || 'Docente'}</p>
                  </div>
                </div>

                {selectedProf?.id === prof.id && (
                  <Check size={16} className="text-[#0a5c2f] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
              Mensagem para o Professor (Opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explique brevemente por que gostaria da mentoria deste docente no projeto..."
              rows={3}
              className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-[var(--agora-muted)] hover:text-[var(--agora-ink)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedProf}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? 'Enviando convite...' : 'Enviar Convite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
