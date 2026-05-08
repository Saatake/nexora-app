import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  Calendar,
  ChevronLeft,
  Clock,
  Download,
  Eye,
  MessageSquare,
  Star,
  UserCircle2
} from 'lucide-react';
import api from '../api/axios';
import AppShell from '../components/AppShell';

type Project = {
  id: number;
  title: string;
  description: string;
  summary?: string | null;
  course?: string | null;
  area?: string | null;
  advisor?: string | null;
  teamMembers?: string | null;
  githubLink: string;
  fileUrl: string;
  category: string;
  authorName: string;
  viewCount: number;
  downloadCount: number;
  averageGrade?: number | null;
  createdAt: string;
  isApproved: boolean;
};

type Evaluation = {
  id: number;
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
  average: number;
  feedback: string;
  professorName: string;
  createdAt: string;
};

type Comment = {
  id: number;
  text: string;
  authorName: string;
  authorId: string;
  createdAt: string;
};

type TabKey = 'overview' | 'evaluations' | 'comments' | 'stats' | 'versions';

const formatCategory = (category: string) => {
  const lookup: Record<string, string> = {
    Tcc: 'TCC',
    Upx: 'UPX',
    IniciacaoCientifica: 'Iniciacao Cientifica',
    Relatorio: 'Relatorio',
    ProjetoEscrito: 'Projeto escrito'
  };
  return lookup[category] ?? category;
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Data desconhecida';
  return parsed.toLocaleDateString('pt-BR');
};

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [error, setError] = useState('');

  const projectId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;

    const loadProject = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [projectResponse, evaluationResponse, commentResponse] = await Promise.all([
          api.get<Project>(`/projects/${projectId}`),
          api.get<Evaluation[]>(`/projects/${projectId}/evaluations`),
          api.get<Comment[]>(`/projects/${projectId}/comments`)
        ]);

        if (!isMounted) return;
        setProject(projectResponse.data);
        setEvaluations(evaluationResponse.data ?? []);
        setComments(commentResponse.data ?? []);

        api.post(`/projects/${projectId}/views`).catch(() => undefined);
      } catch (err) {
        if (isMounted) setError('Nao foi possivel carregar o projeto.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const handleDownload = async () => {
    if (!projectId) return;
    setIsDownloading(true);
    try {
      const response = await api.get(`/projects/${projectId}/download`);
      const url = response.data?.fileUrl as string | undefined;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        setProject((prev) =>
          prev ? { ...prev, downloadCount: prev.downloadCount + 1, fileUrl: url } : prev
        );
      }
    } catch (err) {
      setError('Nao foi possivel baixar o arquivo.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddComment = async () => {
    if (!projectId || !commentText.trim()) return;
    setIsCommenting(true);
    try {
      const response = await api.post<Comment>(`/projects/${projectId}/comments`, {
        text: commentText.trim()
      });
      setComments((prev) => [response.data, ...prev]);
      setCommentText('');
    } catch (err) {
      setError('Nao foi possivel publicar o comentario.');
    } finally {
      setIsCommenting(false);
    }
  };

  const teamMembers = useMemo(() => {
    if (!project?.teamMembers) return [];
    return project.teamMembers
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }, [project]);

  const tags = useMemo(() => {
    const items = [project?.area, project?.course, formatCategory(project?.category ?? '')];
    return items.filter((item) => item && item.length > 0) as string[];
  }, [project]);

  return (
    <AppShell title="Detalhes do Projeto" subtitle="">
      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--agora-muted)] hover:text-[var(--agora-ink)]"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mt-8 h-44 rounded-3xl bg-slate-100 animate-pulse" />
      )}

      {!isLoading && project && (
        <>
          <section className="mt-8 rounded-3xl border border-[var(--agora-border)] bg-white/95 p-6 shadow-[var(--agora-shadow)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[var(--agora-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--agora-accent)]">
                    {formatCategory(project.category)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      project.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {project.isApproved ? <BadgeCheck size={14} /> : <Clock size={14} />}
                    {project.isApproved ? 'Aprovado' : 'Em avaliacao'}
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-semibold text-[var(--agora-ink)]">{project.title}</h2>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--agora-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <UserCircle2 size={16} />
                    {teamMembers.length > 0 ? teamMembers.join(', ') : project.authorName}
                  </span>
                  {project.advisor && (
                    <span className="inline-flex items-center gap-2">
                      <MessageSquare size={16} />
                      Orientador: {project.advisor}
                    </span>
                  )}
                  {project.course && (
                    <span className="inline-flex items-center gap-2">
                      <Calendar size={16} />
                      {project.course}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(project.createdAt).getFullYear()}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading || !project.fileUrl}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[var(--agora-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--agora-shadow)] disabled:opacity-70"
                  >
                    <Download size={16} />
                    {isDownloading ? 'Baixando...' : 'Baixar PDF'}
                  </button>
                  <span className="inline-flex items-center gap-2 text-sm text-[var(--agora-muted)]">
                    <Eye size={16} />
                    {new Intl.NumberFormat('pt-BR').format(project.viewCount)} visualizacoes
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm text-[var(--agora-muted)]">
                    <Download size={16} />
                    {new Intl.NumberFormat('pt-BR').format(project.downloadCount)} downloads
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-3xl bg-emerald-500/10 px-6 py-4 text-emerald-600">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                  <Star size={22} />
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {project.averageGrade ? project.averageGrade.toFixed(1) : '--'}
                  </p>
                  <p className="text-xs text-emerald-700">Nota media</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-[var(--agora-border)] bg-white/95 shadow-[var(--agora-shadow)]">
            <div className="flex flex-wrap border-b border-[var(--agora-border)]">
              {[
                { key: 'overview', label: 'Visao geral' },
                { key: 'evaluations', label: 'Avaliacoes' },
                { key: 'comments', label: 'Comentarios' },
                { key: 'stats', label: 'Estatisticas' },
                { key: 'versions', label: 'Versoes' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`px-6 py-4 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? 'text-[var(--agora-accent)] border-b-2 border-[var(--agora-accent)]'
                      : 'text-[var(--agora-muted)] hover:text-[var(--agora-ink)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--agora-ink)]">Resumo do Projeto</h3>
                    <p className="mt-2 text-sm text-[var(--agora-muted)]">
                      {project.summary || 'Sem resumo informado.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[var(--agora-ink)]">Descricao completa</h3>
                    <p className="mt-2 text-sm text-[var(--agora-muted)] whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[var(--agora-ink)]">Area do conhecimento</h3>
                    <p className="mt-2 text-sm text-[var(--agora-muted)]">{project.area ?? 'Nao informado'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[var(--agora-ink)]">Tecnologias / tags</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.length === 0 && (
                        <span className="text-xs text-[var(--agora-muted)]">Sem tags</span>
                      )}
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[var(--agora-ink)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'evaluations' && (
                <div className="space-y-4">
                  {evaluations.length === 0 && (
                    <p className="text-sm text-[var(--agora-muted)]">Sem avaliacoes ainda.</p>
                  )}
                  {evaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="rounded-2xl border border-[var(--agora-border)] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--agora-ink)]">{evaluation.professorName}</p>
                        <span className="text-xs text-[var(--agora-muted)]">{formatDate(evaluation.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--agora-muted)]">{evaluation.feedback || 'Sem feedback.'}</p>
                      <div className="mt-3 text-sm font-semibold text-emerald-600">
                        Nota media: {evaluation.average.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[var(--agora-border)] p-4">
                    <textarea
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      rows={3}
                      placeholder="Escreva um comentario"
                      className="w-full resize-none text-sm text-[var(--agora-ink)] outline-none"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddComment}
                        disabled={isCommenting}
                        className="rounded-xl bg-[var(--agora-accent)] px-4 py-2 text-xs font-semibold text-white"
                      >
                        {isCommenting ? 'Enviando...' : 'Publicar'}
                      </button>
                    </div>
                  </div>

                  {comments.length === 0 && (
                    <p className="text-sm text-[var(--agora-muted)]">Sem comentarios ainda.</p>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border border-[var(--agora-border)] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--agora-ink)]">{comment.authorName}</p>
                        <span className="text-xs text-[var(--agora-muted)]">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--agora-muted)]">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--agora-border)] p-4 text-center">
                    <p className="text-sm text-[var(--agora-muted)]">Visualizacoes</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--agora-ink)]">
                      {new Intl.NumberFormat('pt-BR').format(project.viewCount)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--agora-border)] p-4 text-center">
                    <p className="text-sm text-[var(--agora-muted)]">Downloads</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--agora-ink)]">
                      {new Intl.NumberFormat('pt-BR').format(project.downloadCount)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--agora-border)] p-4 text-center">
                    <p className="text-sm text-[var(--agora-muted)]">Nota media</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--agora-ink)]">
                      {project.averageGrade ? project.averageGrade.toFixed(1) : '--'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'versions' && (
                <div className="rounded-2xl border border-dashed border-[var(--agora-border)] p-4 text-sm text-[var(--agora-muted)]">
                  Em breve: historico de versoes.
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {!isLoading && !project && (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--agora-border)] p-6 text-sm text-[var(--agora-muted)]">
          Projeto nao encontrado.
        </div>
      )}
    </AppShell>
  );
};

export default ProjectDetailsPage;
