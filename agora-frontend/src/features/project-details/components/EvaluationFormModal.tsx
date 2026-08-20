import type { EvaluationFormData } from '../types';

type EvaluationFormModalProps = {
  evaluationData: EvaluationFormData;
  isEvaluating: boolean;
  isProfessor: boolean;
  error: string;
  onChange: (data: EvaluationFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
};

const baseCriteria = [
  { key: 'relevance', label: 'Relevância' },
  { key: 'quality', label: 'Qualidade' },
  { key: 'methodology', label: 'Metodologia' },
  { key: 'presentation', label: 'Apresentação' },
  { key: 'innovation', label: 'Inovação' },
] as const;

const technicalCriteria = [
  { key: 'theoreticalFoundation', label: 'Embasamento Teórico' },
  { key: 'academicContribution', label: 'Contribuição Acadêmica' },
  { key: 'executionFeasibility', label: 'Viabilidade de Execução' },
] as const;

const EvaluationFormModal = ({
  evaluationData,
  isEvaluating,
  isProfessor,
  error,
  onChange,
  onSubmit,
  onClose,
}: EvaluationFormModalProps) => (
  <div
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-[var(--agora-panel)] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-[var(--agora-ink)]">Nova Avaliação</h3>
        <button
          onClick={onClose}
          className="text-[var(--agora-muted)] hover:text-[var(--agora-ink)]"
        >
          ✕
        </button>
      </div>

      <p className="text-xs font-bold text-[var(--agora-muted)] uppercase tracking-wide mb-2">
        Critérios Gerais
      </p>
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        {baseCriteria.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
              {label} (1–10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={evaluationData[key] || ''}
              onChange={(e) =>
                onChange({ ...evaluationData, [key]: Number(e.target.value) })
              }
              className="w-full border border-[var(--agora-border)] rounded-lg px-3 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)] focus:ring-1 focus:ring-[var(--agora-accent)] outline-none"
            />
          </div>
        ))}
      </div>

      {isProfessor && (
        <div className="mb-4 rounded-xl border border-[var(--agora-accent)] bg-[var(--agora-accent-bg)] p-4">
          <p className="text-xs font-bold text-[var(--agora-accent)] uppercase tracking-wide mb-3">
            Avaliação Técnica (exclusiva de professor)
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {technicalCriteria.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
                  {label} (1–10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={evaluationData[key] || ''}
                  onChange={(e) =>
                    onChange({ ...evaluationData, [key]: Number(e.target.value) })
                  }
                  className="w-full border border-[var(--agora-border)] rounded-lg px-3 py-2 text-sm bg-white text-[var(--agora-ink)] focus:ring-1 focus:ring-[var(--agora-accent)] outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
          Feedback (opcional)
        </label>
        <textarea
          rows={3}
          value={evaluationData.feedback}
          onChange={(e) => onChange({ ...evaluationData, feedback: e.target.value })}
          placeholder="Deixe um comentário sobre o projeto..."
          className="w-full border border-[var(--agora-border)] rounded-lg px-3 py-2 text-sm resize-none bg-[var(--agora-input-bg)] text-[var(--agora-ink)] focus:ring-1 focus:ring-[var(--agora-accent)] outline-none"
        />
      </div>
      {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-[var(--agora-border)] rounded-lg text-sm text-[var(--agora-muted)] hover:text-[var(--agora-ink)]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isEvaluating}
          className="px-5 py-2 bg-[var(--agora-accent)] hover:bg-[var(--agora-accent-hover)] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isEvaluating ? 'Enviando...' : 'Enviar Avaliação'}
        </button>
      </div>
    </div>
  </div>
);

export default EvaluationFormModal;
