import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image, Plus, X } from 'lucide-react';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import AppShell from '../components/AppShell';
import ImageCropModal from '../components/ImageCropModal';
import { FACENS_COURSES } from '../constants/facensCourses';

type ProjectCategory = 'Tcc' | 'Upx' | 'IniciacaoCientifica' | 'Relatorio' | 'ProjetoEscrito';

type Project = {
  id: number;
  title: string;
  description: string;
  summary?: string;
  course?: string;
  area?: string;
  advisor?: string;
  teamMembers?: string;
  githubLink: string;
  fileUrl: string;
  imageUrl?: string;
  category: string;
};

const EditProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const summaryCount = useMemo(() => summary.length, [summary]);

  const inputCls = 'w-full px-4 py-3 border border-[var(--agora-border)] rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400 outline-none';

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        navigate('/projects');
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const response = await api.get<Project>(`/projects/${id}`);
        const project = response.data;

        setTitle(project.title);
        setCategory(project.category as ProjectCategory);
        setSummary(project.summary || '');
        setDescription(project.description);
        setGithubLink(project.githubLink);
        setFileUrl(project.fileUrl);
        setCourse(project.course || '');
        setArea(project.area || '');
        setAdvisor(project.advisor || '');
        setImageUrl(project.imageUrl || '');
        if (project.imageUrl) setCoverPreview(project.imageUrl);
        
        if (project.teamMembers) {
          setMembers(project.teamMembers.split(',').map(m => m.trim()).filter(Boolean));
        }
      } catch {
        setError('Não foi possível carregar o projeto.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

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
    } catch {
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
      await api.put(`/projects/${id}`, {
        title, description, summary, course, area, advisor,
        teamMembers: members.join(', '),
        githubLink, fileUrl, imageUrl, category
      });
      navigate('/projects');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Não foi possível atualizar o projeto.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Editar Projeto" subtitle="" showSearch={false}>
        <div className="mt-8 text-center text-[var(--agora-muted)]">Carregando...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Editar Projeto" subtitle="Atualize as informações do seu trabalho" showSearch={false}>
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
                  className={`mt-2 ${inputCls} bg-[var(--agora-panel)] appearance-none`}
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
                  className={`mt-2 ${inputCls} bg-[var(--agora-panel)] appearance-none`}
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
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverFileSelected} className="hidden" />
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

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-6 py-3 border border-[var(--agora-border)] rounded text-sm font-semibold text-[var(--agora-muted)] hover:bg-[var(--agora-bg)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-300 text-white text-sm font-bold rounded shadow transition-colors"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
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

export default EditProjectPage;
