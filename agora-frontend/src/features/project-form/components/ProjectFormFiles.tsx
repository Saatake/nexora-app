import React from 'react';
import { Image, X } from 'lucide-react';

type Props = {
  coverPreview: string | null;
  isUploadingCover: boolean;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  onCoverFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCover: () => void;
};

const ProjectFormFiles = ({ coverPreview, isUploadingCover, coverInputRef, onCoverFileSelected, onRemoveCover }: Props) => (
  <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
    <h2 className="text-lg font-semibold">Imagem de capa</h2>
    <p className="mt-1 text-sm text-[var(--agora-muted)]">Opcional. Aparece no card e no topo da página do projeto.</p>
    <div className="mt-4 border border-dashed border-[var(--agora-border)] rounded-xl px-4 py-4 hover:border-[var(--agora-accent)] transition-colors">
      {coverPreview ? (
        <div className="relative h-44 rounded-lg overflow-hidden">
          <img src={coverPreview} alt="Prévia da capa do projeto" className="w-full h-full object-cover" />
          {isUploadingCover && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">Enviando…</div>}
          <button type="button" aria-label="Remover capa" onClick={onRemoveCover} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"><X size={14} /></button>
        </div>
      ) : (
        <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--agora-border)] rounded-lg px-4 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:border-[var(--agora-accent)] hover:text-[var(--agora-accent)] transition-colors">
          <Image size={16} /> Selecionar capa (JPG, PNG ou WEBP; até 5 MB)
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onCoverFileSelected} className="hidden" />
        </label>
      )}
    </div>
  </section>
);

export default ProjectFormFiles;
