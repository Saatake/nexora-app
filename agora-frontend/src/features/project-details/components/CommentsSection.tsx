import { MessageSquare } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatters';
import type { Comment } from '../types';

type CommentsSectionProps = {
  comments: Comment[];
  userName?: string;
  commentText: string;
  isCommenting: boolean;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
};

const CommentsSection = ({
  comments,
  userName,
  commentText,
  isCommenting,
  onTextChange,
  onSubmit,
}: CommentsSectionProps) => (
  <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]">
    <h2 className="flex items-center gap-2 text-base font-bold text-[var(--agora-ink)] mb-5">
      <MessageSquare size={18} />
      Comentários ({comments.length})
    </h2>

    <div className="space-y-3 mb-5">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[var(--agora-accent)] flex items-center justify-center text-white font-bold text-sm">
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 bg-[var(--agora-bg)] rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-[var(--agora-ink)]">
                {comment.authorName}
              </span>
              <span className="text-xs text-[var(--agora-muted)]">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-[var(--agora-muted)]">{comment.text}</p>
          </div>
        </div>
      ))}
      {comments.length === 0 && (
        <p className="text-sm text-[var(--agora-muted)]">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      )}
    </div>

    <div className="flex gap-3 items-center">
      <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[var(--agora-accent)] flex items-center justify-center text-white font-bold text-sm">
        {userName?.charAt(0).toUpperCase() ?? 'A'}
      </div>
      <input
        value={commentText}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="Adicionar um comentário..."
        className="flex-1 rounded-lg border border-[var(--agora-border)] bg-[var(--agora-input-bg)] px-4 py-2.5 text-sm text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)]"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={isCommenting || !commentText.trim()}
        className="px-4 py-2.5 bg-[var(--agora-accent)] hover:bg-[var(--agora-accent-hover)] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Enviar
      </button>
    </div>
  </div>
);

export default CommentsSection;
