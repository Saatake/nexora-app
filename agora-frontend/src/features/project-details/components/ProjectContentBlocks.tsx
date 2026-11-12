import { ExternalLink, FileText, Video } from 'lucide-react';
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
  const presentation = [...(pitch ? [pitch] : []), ...supportingBlocks];

  return (
    <section aria-label="Apresentação do projeto" className="space-y-12">
      {presentation.map((block) => {
        const type = normalizeType(block.type);

        if (type === 'Text') {
          return block.text?.trim() ? (
            <article key={block.id} className="max-w-5xl">
              {block.caption && <h2 className="mb-3 text-lg font-semibold text-[var(--agora-ink)]">{block.caption}</h2>}
              <p className="whitespace-pre-line text-base leading-8 text-[var(--agora-ink)] sm:text-lg">{block.text}</p>
            </article>
          ) : null;
        }

        if (type === 'Image') {
          const url = getSafeExternalUrl(block.url);
          return url ? (
            <figure key={block.id}>
              <img
                src={url}
                alt={block.caption || 'Imagem do projeto'}
                loading="lazy"
                className="max-h-[44rem] w-full object-contain object-center"
              />
              {block.caption && <figcaption className="mt-3 text-sm text-[var(--agora-muted)]">{block.caption}</figcaption>}
            </figure>
          ) : null;
        }

        if (type === 'YouTube') {
          const embedUrl = block.url ? getYouTubeEmbedUrl(block.url) : null;
          return embedUrl ? (
            <figure key={block.id} className="space-y-3">
              <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <Video size={17} className="text-[var(--agora-accent)]" />
                <span className="font-bold uppercase tracking-[0.12em] text-[var(--agora-accent)]">Vídeo pitch</span>
                <span className="text-[var(--agora-muted)]">· apresentação do projeto</span>
              </figcaption>
              <div className="aspect-video overflow-hidden rounded-lg bg-black">
                <iframe
                  title="Vídeo pitch do projeto"
                  src={embedUrl}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              {block.caption && <p className="text-sm text-[var(--agora-muted)]">{block.caption}</p>}
            </figure>
          ) : null;
        }

        if (type === 'Document' || type === 'Link') {
          const url = getSafeExternalUrl(block.url);
          return url ? (
            <a
              key={block.id}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center gap-3 border-b border-[var(--agora-border)] py-3 text-[var(--agora-accent)] transition-colors hover:border-[var(--agora-accent)]"
            >
              {type === 'Document' ? <FileText size={19} /> : <ExternalLink size={19} />}
              <span className="text-sm font-semibold">{block.caption || (type === 'Document' ? 'Abrir documento PDF' : 'Abrir link externo')}</span>
              <ExternalLink size={14} className="opacity-70" />
            </a>
          ) : null;
        }

        return null;
      })}
    </section>
  );
};

export default ProjectContentBlocks;
