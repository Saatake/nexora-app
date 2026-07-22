import React from 'react';
import { Image, X } from 'lucide-react';

const inputCls =
  'w-full px-4 py-3 border border-[var(--agora-border)] rounded bg-[var(--agora-input-bg)] focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)] transition-all font-medium text-[var(--agora-ink)] placeholder:text-[var(--agora-muted)] outline-none';

type Props = {
  githubLink: string;
  setGithubLink: (v: string) => void;
  fileUrl: string;
  setFileUrl: (v: string) => void;
  coverPreview: string | null;
  isUploadingCover: boolean;
  isUploading: boolean;
  uploadedFileName: string;
  uploadError: string;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  onCoverFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCover: () => void;
};

const ProjectFormFiles = ({
  githubLink,
  setGithubLink,
  fileUrl,
  setFileUrl,
  coverPreview,
  isUploadingCover,
  isUploading,
  uploadedFileName,
  uploadError,
  coverInputRef,
  onCoverFileSelected,
  onFileUpload,
  onRemoveCover,
}: Props) => (
  <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
    <h2 className="text-lg font-semibold">Links e Arquivos</h2>

    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Github</label>
        <input
          value={githubLink}
          onChange={(e) => setGithubLink(e.target.value)}
          placeholder="https://github.com/seu-projeto"
          className={`mt-2 ${inputCls}`}
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Link do Arquivo</label>
        <input
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="Link do PDF (Drive, Dropbox, etc.)"
          className={`mt-2 ${inputCls}`}
        />
      </div>
    </div>

    <div className="mt-4 border border-dashed border-[var(--agora-border)] rounded-xl px-4 py-4 hover:border-[var(--agora-accent)] transition-colors">
      <p className="text-sm font-semibold text-[var(--agora-ink)] mb-1">Imagem de capa (opcional)</p>
      <p className="text-xs text-[var(--agora-muted)] mb-3">
        Adicione uma imagem para o card do projeto. Máx 5MB.
      </p>
      {coverPreview ? (
        <div className="relative h-36 rounded-lg overflow-hidden mb-3">
          <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
          {isUploadingCover && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">
              Enviando...
            </div>
          )}
          <button
            type="button"
            onClick={onRemoveCover}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--agora-border)] rounded-lg px-4 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:border-[var(--agora-accent)] hover:text-[var(--agora-accent)] transition-colors">
          <Image size={16} />
          Selecionar imagem
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onCoverFileSelected}
            className="hidden"
          />
        </label>
      )}
    </div>

    <div className="mt-4 border border-dashed border-[var(--agora-border)] rounded px-4 py-4 hover:border-green-800 transition-colors">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--agora-ink)]">Enviar PDF</p>
          <p className="text-xs text-[var(--agora-muted)]">
            Máximo 20MB. O link será preenchido automaticamente.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--agora-border)] rounded px-4 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:border-green-800 hover:text-green-800 transition-colors">
          <input
            type="file"
            accept="application/pdf"
            onChange={onFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? 'Enviando...' : 'Selecionar PDF'}
        </label>
      </div>
      {uploadedFileName && (
        <p className="mt-3 text-xs text-[var(--agora-muted)]">Arquivo enviado: {uploadedFileName}</p>
      )}
      {uploadError && <p className="mt-2 text-xs text-rose-600">{uploadError}</p>}
    </div>
  </section>
);

export default ProjectFormFiles;
