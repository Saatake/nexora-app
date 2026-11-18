import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  totalPages: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
};

const getPageNumbers = (current: number, total: number): (number | 'ellipsis')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);

  return pages;
};

const Pagination = ({ page, totalPages, totalCount, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--agora-border)]">
      <p className="text-xs text-[var(--agora-muted)]">
        Página <span className="font-semibold text-[var(--agora-ink)]">{page}</span> de{' '}
        <span className="font-semibold text-[var(--agora-ink)]">{totalPages}</span>
        {totalCount != null && (
          <span> · {totalCount} {totalCount === 1 ? 'item' : 'itens'}</span>
        )}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--agora-border)] bg-[var(--agora-panel)] px-2.5 py-1.5 text-xs font-medium text-[var(--agora-ink)] hover:border-[var(--agora-accent)]/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-1.5 text-xs text-[var(--agora-muted)]">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`min-w-[32px] h-8 rounded-lg px-2 text-xs font-semibold border transition-colors ${
                item === page
                  ? 'bg-[#0a5c2f] text-white border-[#0a5c2f]'
                  : 'bg-[var(--agora-panel)] text-[var(--agora-ink)] border-[var(--agora-border)] hover:border-[var(--agora-accent)]/50'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--agora-border)] bg-[var(--agora-panel)] px-2.5 py-1.5 text-xs font-medium text-[var(--agora-ink)] hover:border-[var(--agora-accent)]/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
