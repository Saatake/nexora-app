import { MessageSquare } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatters';
import RoleBadge from '@/components/RoleBadge';
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
  <section className="border-t border-[var(--agora-border)] pt-8">
    <h2 className="mb-5 flex items-center gap-2 border-b border-[var(--agora-border)] pb-4 text-base font-bold text-[var(--agora-ink)]">
      <MessageSquare size={18} />
      Comentários ({comments.length})
    </h2>

    <div className="mb-6 space-y-5">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[var(--agora-accent)] flex items-center justify-center text-white font-bold text-sm">
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 border-b border-[var(--agora-border)] pb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--agora-ink)]">
                  {comment.authorName}
                </span>
                <RoleBadge role={comment.authorRoleType} />
              </div>
              <span className="text-xs text-[var(--agora-muted)]">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--agora-ink)]">{comment.text}</p>
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
        className="min-w-0 flex-1 border-b border-[var(--agora-border)] bg-transparent px-1 py-2.5 text-sm text-[var(--agora-ink)] outline-none focus:border-[var(--agora-accent)]"
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
  </section>
);

export default CommentsSection;
