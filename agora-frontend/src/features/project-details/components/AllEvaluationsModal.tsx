import { formatDate } from '@/shared/utils/formatters';
import EvalBar from './EvalBar';
import type { Evaluation } from '../types';

type AllEvaluationsModalProps = {
  evaluations: Evaluation[];
  onClose: () => void;
};

const AllEvaluationsModal = ({ evaluations, onClose }: AllEvaluationsModalProps) => (
  <div
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-[var(--agora-panel)] rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-[var(--agora-ink)]">
          Todas as avaliações ({evaluations.length})
        </h3>
        <button onClick={onClose} className="text-[var(--agora-muted)] hover:text-[var(--agora-ink)]">
          ✕
        </button>
      </div>
      <div className="space-y-5">
        {evaluations.map((ev) => (
          <div key={ev.id} className="rounded-xl border border-[var(--agora-border)] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-[var(--agora-ink)]">{ev.professorName}</p>
              <span className="text-xs text-[var(--agora-muted)]">{formatDate(ev.createdAt)}</span>
            </div>
            <div className="space-y-2 mb-3">
              <EvalBar label="Relevância" value={ev.relevance} />
              <EvalBar label="Qualidade" value={ev.quality} />
              <EvalBar label="Metodologia" value={ev.methodology} />
              <EvalBar label="Apresentação" value={ev.presentation} />
              <EvalBar label="Inovação" value={ev.innovation} />
            </div>
            {ev.feedback && (
              <p className="text-sm text-[var(--agora-muted)] italic mb-2">"{ev.feedback}"</p>
            )}
            <p className="text-sm font-semibold text-emerald-600">Média: {ev.average.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AllEvaluationsModal;
