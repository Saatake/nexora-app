import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Plus, X, Lock } from 'lucide-react';
import api from '../api/axios';
import AppShell from '../components/AppShell';
import ImageCropModal from '../components/ImageCropModal';
import { FACENS_COURSES } from '../constants/facensCourses';

type ProjectCategory = 'Tcc' | 'Upx' | 'IniciacaoCientifica' | 'Relatorio' | 'ProjetoEscrito';

const NewProjectPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Tcc');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [course, setCourse] = useState('');
  const [area, setArea] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const summaryCount = useMemo(() => summary.length, [summary]);

  const inputCls = 'w-full px-4 py-3 border border-[var(--agora-border)] rounded bg-[var(--agora-input-bg)] focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)] transition-all font-medium text-[var(--agora-ink)] placeholder:text-[var(--agora-muted)] outline-none';

  const handleAddMember = () => {
    const trimmed = memberName.trim();
    if (!trimmed) return;
    setMembers((prev) => [...prev, trimmed]);
    setMemberName('');
  };

  const handleRemoveMember = (member: string) => {
    setMembers((prev) => prev.filter((item) => item !== member));
  };

  const handleCoverFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Imagem deve ser JPG, PNG ou WEBP.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setCropSrc(e.target?.result as string);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    const previewUrl = URL.createObjectURL(blob);
    setCoverPreview(previewUrl);
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'cover.jpg');
      const response = await api.post('/uploads/project-cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageUrl(response.data.url ?? '');
    } catch {
      setUploadError('Não foi possível enviar a imagem de capa.');
      setCoverPreview(null);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    if (file.type !== 'application/pdf') {
      setUploadError('Envie apenas PDF.');
      return;
    }

    if (file.size > 20_000_000) {
      setUploadError('Arquivo acima de 20MB.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/uploads/project-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFileUrl(response.data.url ?? '');
      setUploadedFileName(response.data.fileName ?? file.name);
    } catch (err) {
      setUploadError('Nao foi possivel enviar o arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await api.post('/projects', {
        title, description, summary, course, area, advisor,
        teamMembers: members.join(', '),
        githubLink, fileUrl, imageUrl, category,
        isPrivate
      });
      navigate('/projects');
    } catch (err) {
      setError('Nao foi possivel publicar o projeto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell title="Criar Novo Projeto" subtitle="Publique seu trabalho academico na plataforma" showSearch={false}>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
          <h2 className="text-lg font-semibold">Informacoes Basicas</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Titulo do Projeto *</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                placeholder="Ex: Sistema de Gestao Academica com IA"
                className={`mt-2 ${inputCls}`}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-[var(--agora-ink)]">Tipo de Projeto *</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as ProjectCategory)}
                  className={`mt-2 ${inputCls} appearance-none`}
                >
                  <option value="Tcc">TCC</option>
                  <option value="Upx">UPX</option>
                  <option value="IniciacaoCientifica">Iniciacao Cientifica</option>
                  <option value="Relatorio">Relatorio</option>
                  <option value="ProjetoEscrito">Projeto escrito</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--agora-ink)]">Curso</label>
                <select
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                  className={`mt-2 ${inputCls} appearance-none`}
                >
                  <option value="">Selecione o curso</option>
                  {FACENS_COURSES.map((courseOption) => (
                    <option key={courseOption} value={courseOption}>
                      {courseOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Area do Conhecimento</label>
              <input
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="Selecione a area"
                className={`mt-2 ${inputCls}`}
              />
            </div>
          </div>
        </section>

        <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
          <h2 className="text-lg font-semibold">Equipe</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Integrantes</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={memberName}
                  onChange={(event) => setMemberName(event.target.value)}
                  placeholder="Nome do integrante"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-2 px-4 py-3 border border-[var(--agora-border)] rounded text-sm font-semibold text-[var(--agora-muted)] hover:border-green-800 hover:text-green-800 transition-colors"
                >
                  <Plus size={16} />
                  Adicionar integrante
                </button>
              </div>

              {members.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {members.map((member) => (
                    <span
                      key={member}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-[#0a5c2f] text-xs font-semibold rounded"
                    >
                      {member}
                      <button type="button" onClick={() => handleRemoveMember(member)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Professor Orientador</label>
              <input
                value={advisor}
                onChange={(event) => setAdvisor(event.target.value)}
                required
                placeholder="Ex: Prof. Dr. Joao Silva"
                className={`mt-2 ${inputCls}`}
              />
            </div>
          </div>
        </section>

        <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
          <h2 className="text-lg font-semibold">Descricao</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Resumo</label>
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Breve resumo do projeto (maximo 200 caracteres)"
                className={`mt-2 ${inputCls} resize-none`}
              />
              <p className="mt-2 text-xs text-[var(--agora-muted)]">{summaryCount}/200 caracteres</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Descricao Completa *</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                required
                placeholder="Descreva detalhadamente seu projeto, metodologia, objetivos e resultados"
                className={`mt-2 ${inputCls} resize-none`}
              />
            </div>
          </div>
        </section>

        <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
          <h2 className="text-lg font-semibold">Links e Arquivos</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Github</label>
              <input
                value={githubLink}
                onChange={(event) => setGithubLink(event.target.value)}
                placeholder="https://github.com/seu-projeto"
                className={`mt-2 ${inputCls}`}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Link do Arquivo</label>
              <input
                value={fileUrl}
                onChange={(event) => setFileUrl(event.target.value)}
                placeholder="Link do PDF (Drive, Dropbox, etc.)"
                className={`mt-2 ${inputCls}`}
              />
            </div>
          </div>

          <div className="mt-4 border border-dashed border-[var(--agora-border)] rounded-xl px-4 py-4 hover:border-[var(--agora-accent)] transition-colors">
            <p className="text-sm font-semibold text-[var(--agora-ink)] mb-1">Imagem de capa (opcional)</p>
            <p className="text-xs text-[var(--agora-muted)] mb-3">Adicione uma imagem para o card do projeto. Máx 5MB.</p>
            {coverPreview ? (
              <div className="relative h-36 rounded-lg overflow-hidden mb-3">
                <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
                {isUploadingCover && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">Enviando...</div>
                )}
                <button
                  type="button"
                  onClick={() => { setCoverPreview(null); setImageUrl(''); }}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--agora-border)] rounded-lg px-4 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:border-[var(--agora-accent)] hover:text-[var(--agora-accent)] transition-colors">
                <Image size={16} />
                Selecionar imagem
                <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverFileSelected} className="hidden" />
              </label>
            )}
          </div>

          <div className="mt-4 border border-dashed border-[var(--agora-border)] rounded px-4 py-4 hover:border-green-800 transition-colors">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--agora-ink)]">Enviar PDF</p>
                <p className="text-xs text-[var(--agora-muted)]">Maximo 20MB. O link sera preenchido automaticamente.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--agora-border)] rounded px-4 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:border-green-800 hover:text-green-800 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
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

        <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
          <div className="flex items-start gap-3">
            <input
              id="isPrivate"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0a5c2f] focus:ring-[#0a5c2f] cursor-pointer"
            />
            <div className="text-sm">
              <label htmlFor="isPrivate" className="font-semibold text-[var(--agora-ink)] cursor-pointer text-base">
                <Lock size={16} className="text-gray-400 inline-block mr-1" /> Tornar projeto privado
              </label>
              <p className="text-[var(--agora-muted)] mt-1">
                Ao ativar esta opção, o projeto não aparecerá nos feeds públicos, buscas ou rankings. Apenas você poderá visualizá-lo.
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"></div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-300 text-white text-sm font-bold rounded shadow transition-colors"
          >
            {isSaving ? 'Publicando...' : 'Publicar projeto'}
          </button>
        </div>
      </form>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={16 / 9}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </AppShell>
  );
};

export default NewProjectPage;
