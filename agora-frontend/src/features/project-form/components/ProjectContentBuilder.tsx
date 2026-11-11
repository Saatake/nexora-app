import { useState } from 'react';
import { ArrowDown, ArrowUp, FileText, ImagePlus, Link2, LoaderCircle, Type, Video, X } from 'lucide-react';
import { getYouTubeEmbedUrl, moveProjectContentBlock, type ProjectContentBlockDraft, type ProjectContentBlockType } from '../projectContent';

type Props = {
  blocks: ProjectContentBlockDraft[];
  onChange: (blocks: ProjectContentBlockDraft[]) => void;
  uploadImage: (file: File) => Promise<string>;
  uploadDocument: (file: File) => Promise<string>;
};

const kinds: Array<{ type: ProjectContentBlockType; label: string; icon: typeof Type }> = [
  { type: 'Text', label: 'Texto', icon: Type },
  { type: 'Image', label: 'Imagens', icon: ImagePlus },
  { type: 'YouTube', label: 'Vídeo do YouTube', icon: Video },
  { type: 'Document', label: 'PDF', icon: FileText },
  { type: 'Link', label: 'Link externo', icon: Link2 },
];

const newBlock = (type: ProjectContentBlockType, sortOrder: number): ProjectContentBlockDraft => ({
  id: crypto.randomUUID(), type, sortOrder,
  ...(type === 'Text' ? { text: '' } : { url: '' }),
});

const ProjectContentBuilder = ({ blocks, onChange, uploadImage, uploadDocument }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const update = (id: string, changes: Partial<ProjectContentBlockDraft>) =>
    onChange(blocks.map((block) => block.id === id ? { ...block, ...changes } : block));

  const handleImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = 30 - blocks.length;
    if (remaining <= 0) { setUploadError('Este projeto já atingiu o limite de 30 blocos.'); return; }
    if (files.length > remaining) { setUploadError(`Você pode adicionar mais ${remaining} bloco(s) de imagem.`); return; }
    setUploadError(''); setUploading(true);
    try {
      const images = await Promise.all(Array.from(files).map(async (file) => ({
        ...newBlock('Image', blocks.length), url: await uploadImage(file), caption: file.name,
      })));
      onChange([...blocks, ...images].map((block, sortOrder) => ({ ...block, sortOrder })));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Não foi possível enviar uma das imagens.');
    } finally { setUploading(false); }
  };

  const handleDocument = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(''); setUploading(true);
    try {
      const url = await uploadDocument(file);
      onChange([...blocks, { ...newBlock('Document', blocks.length), url, caption: file.name }]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Não foi possível enviar o PDF.');
    } finally { setUploading(false); }
  };

  return (
    <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Apresente seu projeto</h2>
          <p className="mt-1 text-sm text-[var(--agora-muted)]">Monte uma página com os formatos que combinam com o seu trabalho. Você pode adicionar até 30 blocos.</p>
        </div>
        {uploading && <span className="inline-flex items-center gap-2 text-xs text-[var(--agora-muted)]"><LoaderCircle size={15} className="animate-spin" /> Enviando arquivo…</span>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {kinds.map(({ type, label, icon: Icon }) => (
          <button key={type} type="button" disabled={uploading || blocks.length >= 30}
            onClick={() => type === 'Image' ? document.getElementById('project-content-images')?.click() : type === 'Document' ? document.getElementById('project-content-document')?.click() : onChange([...blocks, newBlock(type, blocks.length)])}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--agora-border)] px-3 py-2.5 text-sm font-semibold text-[var(--agora-ink)] hover:border-[var(--agora-accent)] hover:text-[var(--agora-accent)] disabled:opacity-50">
            <Icon size={16} /><span>{label}</span>
          </button>
        ))}
      </div>
      <input id="project-content-images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => { void handleImages(event.target.files); event.target.value = ''; }} />
      <input id="project-content-document" type="file" accept="application/pdf" className="hidden" onChange={(event) => { void handleDocument(event.target.files?.[0]); event.target.value = ''; }} />
      {uploadError && <p role="alert" className="mt-3 text-sm text-rose-600">{uploadError}</p>}

      {blocks.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--agora-border)] px-4 py-8 text-center text-sm text-[var(--agora-muted)]">Adicione texto, imagens, vídeo, um PDF ou links para mostrar diferentes partes do projeto.</div>
      ) : (
        <div className="mt-4 space-y-3">
          {blocks.map((block, index) => (
            <article key={block.id} className="rounded-lg border border-[var(--agora-border)] p-4">
              <header className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-[var(--agora-ink)]">{kinds.find((kind) => kind.type === block.type)?.label ?? block.type} <span className="font-normal text-[var(--agora-muted)]">{index + 1}</span></span>
                <div className="flex gap-1">
                  <button type="button" aria-label="Mover para cima" disabled={index === 0} onClick={() => onChange(moveProjectContentBlock(blocks, index, -1))} className="rounded p-1.5 text-[var(--agora-muted)] hover:bg-[var(--agora-bg)] disabled:opacity-30"><ArrowUp size={16} /></button>
                  <button type="button" aria-label="Mover para baixo" disabled={index === blocks.length - 1} onClick={() => onChange(moveProjectContentBlock(blocks, index, 1))} className="rounded p-1.5 text-[var(--agora-muted)] hover:bg-[var(--agora-bg)] disabled:opacity-30"><ArrowDown size={16} /></button>
                  <button type="button" aria-label="Remover bloco" onClick={() => onChange(blocks.filter((item) => item.id !== block.id).map((item, sortOrder) => ({ ...item, sortOrder })))} className="rounded p-1.5 text-rose-600 hover:bg-rose-50"><X size={16} /></button>
                </div>
              </header>
              {block.type === 'Text' ? (
                <textarea value={block.text ?? ''} onChange={(event) => update(block.id, { text: event.target.value })} rows={4} maxLength={5000} placeholder="Conte sobre o processo, contexto, resultados ou qualquer detalhe importante…" className="w-full resize-y rounded border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-sm text-[var(--agora-ink)]" />
              ) : (
                <>
                  <input value={block.url ?? ''} readOnly={block.type === 'Image' || block.type === 'Document'} onChange={(event) => update(block.id, { url: event.target.value })} placeholder={block.type === 'YouTube' ? 'Cole o link do vídeo do YouTube' : block.type === 'Link' ? 'https://…' : 'Arquivo enviado'} className="w-full rounded border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-sm text-[var(--agora-ink)] read-only:opacity-70" />
                  {block.type === 'YouTube' && block.url && getYouTubeEmbedUrl(block.url) && <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-black"><iframe title={block.caption || 'Vídeo do projeto'} src={getYouTubeEmbedUrl(block.url)!} className="h-full w-full" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>}
                </>
              )}
              <input value={block.caption ?? ''} onChange={(event) => update(block.id, { caption: event.target.value })} maxLength={300} placeholder="Legenda (opcional)" className="mt-2 w-full rounded border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-2.5 text-sm text-[var(--agora-ink)]" />
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProjectContentBuilder;
