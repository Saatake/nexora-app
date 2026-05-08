import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import api from '../api/axios';
import AppShell from '../components/AppShell';
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const summaryCount = useMemo(() => summary.length, [summary]);

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
        
        if (project.teamMembers) {
          setMembers(project.teamMembers.split(',').map(m => m.trim()).filter(Boolean));
        }
      } catch (err: any) {
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
      await api.put(`/projects/${id}`, {
        title,
        description,
        summary,
        course,
        area,
        advisor,
        teamMembers: members.join(', '),
        githubLink,
        fileUrl,
        category
      });
      navigate('/projects');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível atualizar o projeto.';
      setError(message);
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

        <section className="rounded-3xl border border-[var(--agora-border)] bg-white/95 p-6 shadow-[var(--agora-shadow)]">
          <h2 className="text-lg font-semibold">Informacoes Basicas</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Titulo do Projeto *</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                placeholder="Ex: Sistema de Gestao Academica com IA"
                className="mt-2 w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-[var(--agora-ink)]">Tipo de Projeto *</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as ProjectCategory)}
                  className="mt-2 w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
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
                  className="mt-2 w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
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
                className="mt-2 w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--agora-border)] bg-white/95 p-6 shadow-[var(--agora-shadow)]">
          <h2 className="text-lg font-semibold">Equipe</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Integrantes</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={memberName}
                  onChange={(event) => setMemberName(event.target.value)}
                  placeholder="Nome do integrante"
                  className="w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm font-semibold text-[var(--agora-accent)]"
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
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[var(--agora-ink)]"
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
                className="mt-2 w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--agora-border)] bg-white/95 p-6 shadow-[var(--agora-shadow)]">
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
                className="mt-2 w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
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
                className="mt-2 w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--agora-border)] bg-white/95 p-6 shadow-[var(--agora-shadow)]">
          <h2 className="text-lg font-semibold">Links e Arquivos</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Github</label>
              <input
                value={githubLink}
                onChange={(event) => setGithubLink(event.target.value)}
                placeholder="https://github.com/seu-projeto"
                className="mt-2 w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--agora-ink)]">Link do Arquivo</label>
              <input
                value={fileUrl}
                onChange={(event) => setFileUrl(event.target.value)}
                placeholder="Link do PDF (Drive, Dropbox, etc.)"
                className="mt-2 w-full rounded-2xl border border-[var(--agora-border)] px-4 py-3 text-sm outline-none focus:border-[var(--agora-accent)]"
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-[var(--agora-border)] bg-slate-50 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--agora-ink)]">Enviar PDF</p>
                <p className="text-xs text-[var(--agora-muted)]">Maximo 20MB. O link sera preenchido automaticamente.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-[var(--agora-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--agora-accent)]">
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
            className="rounded-2xl border border-[var(--agora-border)] px-6 py-3 text-sm font-semibold text-[var(--agora-ink)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-2xl bg-[var(--agora-accent)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </AppShell>
  );
};

export default EditProjectPage;
