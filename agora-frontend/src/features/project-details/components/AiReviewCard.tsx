import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { AiReview } from '../types';

type AiReviewCardProps = {
  aiReview: AiReview;
  showFeedback: boolean;
  onToggleFeedback: () => void;
};

const AiReviewCard = ({ aiReview, showFeedback, onToggleFeedback }: AiReviewCardProps) => (
  <div className="rounded-2xl border border-violet-200 bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-[var(--agora-ink)] flex items-center gap-2">
        ✨ Avaliação por IA
        <span className="text-xs font-normal text-[var(--agora-muted)]">sugestão automática</span>
      </h2>
      <span className="text-2xl font-bold text-violet-600">{aiReview.average.toFixed(1)}</span>
    </div>
    <div className="space-y-2.5 mb-4">
      {(
        [
          ['Relevância', aiReview.relevance],
          ['Qualidade', aiReview.quality],
          ['Metodologia', aiReview.methodology],
          ['Apresentação', aiReview.presentation],
          ['Inovação', aiReview.innovation],
        ] as [string, number][]
      ).map(([label, value]) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--agora-muted)]">{label}</span>
            <span className="font-semibold text-[var(--agora-ink)]">{value.toFixed(1)}</span>
          </div>
          <div className="h-1.5 bg-[var(--agora-border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${(value / 10) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
    <div className="border-t border-[var(--agora-border)] pt-4">
      <button
        onClick={onToggleFeedback}
        className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 mb-3"
      >
        <ChevronDown
          size={14}
          className={`transition-transform ${showFeedback ? 'rotate-180' : ''}`}
        />
        {showFeedback ? 'Ocultar análise detalhada' : 'Ver análise detalhada'}
      </button>
      {showFeedback && (
        <div className="space-y-4 text-sm text-[var(--agora-muted)] leading-relaxed [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-[var(--agora-ink)] [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:mb-3">
          <ReactMarkdown>{aiReview.feedback}</ReactMarkdown>
        </div>
      )}
    </div>
  </div>
);

export default AiReviewCard;
