import { ExternalLink, FileText } from 'lucide-react';
import { getSafeExternalUrl, getYouTubeEmbedUrl } from '@/features/project-form/projectContent';
import type { ProjectContentBlock } from '../types';

type Block = ProjectContentBlock;

const normalizeType = (type: Block['type']): string => typeof type === 'number'
  ? ({ 1: 'Text', 2: 'Image', 3: 'YouTube', 4: 'Document', 5: 'Link' } as Record<number, string>)[type] ?? ''
  : type;

const ProjectContentBlocks = ({ blocks }: { blocks?: Block[] }) => {
  const ordered = [...(blocks ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  if (!ordered.length) return null;
  const pitch = ordered.find((block) => normalizeType(block.type) === 'YouTube');
  const supportingBlocks = ordered.filter((block) => normalizeType(block.type) !== 'YouTube');

  return (
    <section aria-label="Apresentação do projeto" className="space-y-4">
      {[...(pitch ? [pitch] : []), ...supportingBlocks].map((block) => {
        const type = normalizeType(block.type);
        if (type === 'Text') return block.text?.trim() ? <article key={block.id} className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]"><p className="whitespace-pre-line text-sm leading-relaxed text-[var(--agora-ink)]">{block.text}</p></article> : null;
        if (type === 'Image') {
          const url = getSafeExternalUrl(block.url);
          return url ? <figure key={block.id} className="overflow-hidden rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)]"><img src={url} alt={block.caption || 'Imagem do projeto'} loading="lazy" className="max-h-[38rem] w-full object-contain" />{block.caption && <figcaption className="px-4 py-3 text-sm text-[var(--agora-muted)]">{block.caption}</figcaption>}</figure> : null;
        }
        if (type === 'YouTube') {
          const embedUrl = block.url ? getYouTubeEmbedUrl(block.url) : null;
          return embedUrl ? <figure key={block.id} className="overflow-hidden rounded-2xl border border-emerald-200 bg-[var(--agora-panel)] shadow-[var(--agora-shadow)]"><figcaption className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50 px-5 py-3"><span className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">Vídeo pitch</span><span className="text-xs font-medium text-emerald-700">Apresentação do projeto</span></figcaption><div className="aspect-video bg-black"><iframe title="Vídeo pitch do projeto" src={embedUrl} className="h-full w-full" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>{block.caption && <div className="px-5 py-3 text-sm text-[var(--agora-muted)]">{block.caption}</div>}</figure> : null;
        }
        if (type === 'Document' || type === 'Link') {
          const url = getSafeExternalUrl(block.url);
          return url ? <a key={block.id} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-4 text-[var(--agora-accent)] shadow-[var(--agora-shadow)] hover:border-[var(--agora-accent)]"><span className="rounded-lg bg-[var(--agora-accent-bg)] p-2">{type === 'Document' ? <FileText size={20} /> : <ExternalLink size={20} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{block.caption || (type === 'Document' ? 'Abrir documento PDF' : 'Abrir link externo')}</span><span className="text-xs text-[var(--agora-muted)]">{type === 'Document' ? 'Documento PDF' : 'Link externo'}</span></span><ExternalLink size={16} /></a> : null;
        }
        return null;
      })}
    </section>
  );
};

export default ProjectContentBlocks;
