import { useState } from 'react';
import { X, GraduationCap } from 'lucide-react';

type OfferMentorshipModalProps = {
  projectTitle: string;
  onClose: () => void;
  onOffer: (message?: string) => Promise<{ success: boolean; error?: string }>;
};

export const OfferMentorshipModal = ({ projectTitle, onClose, onOffer }: OfferMentorshipModalProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const res = await onOffer(message);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Erro ao enviar solicitação.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--agora-muted)] hover:text-[var(--agora-ink)] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#0a5c2f]/10 text-[#0a5c2f]">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--agora-ink)]">Solicitar Orientação</h2>
            <p className="text-xs text-[var(--agora-muted)]">
              Oferecer mentoria acadêmica para o projeto
            </p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-[var(--agora-card-bg)] border border-[var(--agora-border)]">
          <p className="text-xs text-[var(--agora-muted)]">Projeto selecionado:</p>
          <p className="text-sm font-bold text-[var(--agora-ink)] truncate">{projectTitle}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
              Mensagem para os Alunos (Opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Diga aos alunos o que achou da proposta e como pode contribuir como orientador..."
              rows={4}
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
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? 'Enviando proposta...' : 'Enviar Proposta de Orientação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
