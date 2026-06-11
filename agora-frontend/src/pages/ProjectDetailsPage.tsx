import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  Download,
  Eye,
  ExternalLink,
  MessageSquare,
  Star,
  UserCircle2,
  X
} from 'lucide-react';
import api from '../api/axios';
import AppShell from '../components/AppShell';
import { useAuth } from '../contexts/AuthContext';

type AiReview = {
  relevance: number;
  quality: number;
  methodology: number;
  presentation: number;
  innovation: number;
  average: number;
  feedback: string;
};

type Collaborator = {
  id: string;
  name: string;
  photoUrl?: string | null;
  course?: string | null;
};

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
  imageUrl?: string | null;
  category: string;
  authorId: string;
  authorName: string;
  viewCount: number;
  downloadCount: number;
  averageGrade?: number | null;
  createdAt: string;
  collaborators?: Collaborator[];
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
  professorId: string;
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

const formatCategory = (category: string) => {
  const lookup: Record<string, string> = {
    Tcc: 'TCC',
    Upx: 'UPX',
    IniciacaoCientifica: 'IC',
    Relatorio: 'Relatório',
    ProjetoEscrito: 'Projeto escrito'
  };
  return lookup[category] ?? category;
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Data desconhecida';
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const EvalBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-[var(--agora-muted)]">{label}</span>
      <span className="font-semibold text-[var(--agora-ink)]">{value.toFixed(1)}</span>
    </div>
    <div className="h-1.5 bg-[var(--agora-border)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-[var(--agora-accent)]"
        style={{ width: `${(value / 10) * 100}%` }}
      />
    </div>
  </div>
);

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [showAllEvals, setShowAllEvals] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [aiReview, setAiReview] = useState<AiReview | null>(null);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    relevance: 0, quality: 0, methodology: 0, presentation: 0, innovation: 0, feedback: ''
  });
  const [error, setError] = useState('');

  const projectId = useMemo(() => Number(id), [id]);

  const canEvaluate = useMemo(() => {
    if (!user || !project) return false;
    if (project.authorId === user.id) return false;
    return !evaluations.some(e => e.professorId === user.id);
  }, [user, project, evaluations]);

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
      } catch {
        if (isMounted) setError('Não foi possível carregar o projeto.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadProject();
    return () => { isMounted = false; };
  }, [projectId]);

  const handleDownload = async () => {
    if (!projectId) return;
    setIsDownloading(true);
    try {
      const response = await api.get(`/projects/${projectId}/download`);
      const url = response.data?.fileUrl as string | undefined;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        setProject(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : prev);
      }
    } catch { setError('Não foi possível baixar o arquivo.'); }
    finally { setIsDownloading(false); }
  };

  const handleAddComment = async () => {
    if (!projectId || !commentText.trim()) return;
    setIsCommenting(true);
    try {
      const response = await api.post<Comment>(`/projects/${projectId}/comments`, { text: commentText.trim() });
      setComments(prev => [...prev, response.data]);
      setCommentText('');
    } catch { setError('Não foi possível publicar o comentário.'); }
    finally { setIsCommenting(false); }
  };

  const handleSubmitEvaluation = async () => {
    if (!projectId) return;
    const { relevance, quality, methodology, presentation, innovation } = evaluationData;
    if ([relevance, quality, methodology, presentation, innovation].some(v => v === 0)) {
      setError('Por favor, preencha todas as notas de 1 a 10.');
      return;
    }
    setIsEvaluating(true);
    setError('');
    try {
      await api.post(`/projects/${projectId}/evaluations`, evaluationData);
      const [evalRes, projRes] = await Promise.all([
        api.get<Evaluation[]>(`/projects/${projectId}/evaluations`),
        api.get<Project>(`/projects/${projectId}`)
      ]);
      setEvaluations(evalRes.data ?? []);
      setProject(projRes.data);
      setEvaluationData({ relevance: 0, quality: 0, methodology: 0, presentation: 0, innovation: 0, feedback: '' });
      setShowEvaluationForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Não foi possível enviar a avaliação.');
    } finally { setIsEvaluating(false); }
  };

  const teamMembers = useMemo(() => {
    if (!project?.teamMembers) return [];
    return project.teamMembers.split(',').map(s => s.trim()).filter(Boolean);
  }, [project]);

  const latestEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;

  const handleAiReview = async () => {
    if (!projectId) return;
    setIsAiReviewing(true);
    setError('');
    try {
      const res = await api.post<AiReview>(`/projects/${projectId}/ai-review`);
      setAiReview(res.data);
    } catch {
      setError('Não foi possível gerar a avaliação com IA.');
    } finally {
      setIsAiReviewing(false);
    }
  };

  return (
    <AppShell title="" subtitle="" showSearch={false}>
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-[var(--agora-muted)] hover:text-[var(--agora-accent)] mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="h-32 rounded-2xl bg-[var(--agora-border)] animate-pulse" />
            <div className="h-64 rounded-2xl bg-[var(--agora-border)] animate-pulse" />
          </div>
        )}

        {!isLoading && project && (
          <>
            {/* Hero header card */}
            <div className="mb-6 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)] overflow-hidden">
              {project.imageUrl && (
                <div className="h-56 w-full overflow-hidden">
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--agora-accent-bg)] text-[var(--agora-accent)]">
                    {formatCategory(project.category)}
                  </span>

                  {project.averageGrade != null && (
                    <span className="ml-auto inline-flex items-center gap-1.5 text-xl font-bold text-amber-500">
                      <Star size={20} className="fill-amber-400 text-amber-400" />
                      {project.averageGrade.toFixed(1)}
                      <span className="text-xs font-normal text-[var(--agora-muted)] ml-0.5">média geral</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--agora-ink)] mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {project.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[var(--agora-muted)] mb-5">
                  <span className="inline-flex items-center gap-1.5">
                    <UserCircle2 size={15} />
                    <Link
                      to={`/profile/${project.authorId}`}
                      className="hover:text-[var(--agora-accent)] hover:underline transition-colors"
                    >
                      {project.authorName}
                    </Link>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={15} />
                    {formatDate(project.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye size={15} />
                    {new Intl.NumberFormat('pt-BR').format(project.viewCount)} visualizações
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Download size={15} />
                    {new Intl.NumberFormat('pt-BR').format(project.downloadCount)} downloads
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading || !project.fileUrl}
                    className="px-5 py-2.5 bg-[var(--agora-accent)] hover:bg-[var(--agora-accent-hover)] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {isDownloading ? 'Baixando...' : 'Baixar PDF'}
                  </button>
                  {user?.id === project.authorId && (
                    <button
                      type="button"
                      onClick={handleAiReview}
                      disabled={isAiReviewing}
                      className="px-5 py-2.5 border border-[var(--agora-border)] bg-[var(--agora-panel)] hover:border-violet-400 hover:text-violet-600 disabled:opacity-50 text-[var(--agora-muted)] text-sm font-semibold rounded-lg transition-colors"
                    >
                      {isAiReviewing ? 'Analisando...' : '✨ Avaliar com IA'}
                    </button>
                  )}

                </div>
              </div>
            </div>

            {/* 2-column layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {project.summary && (
                  <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]">
                    <h2 className="text-base font-bold text-[var(--agora-ink)] mb-3">Resumo</h2>
                    <p className="text-sm text-[var(--agora-muted)] leading-relaxed">{project.summary}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]">
                  <h2 className="text-base font-bold text-[var(--agora-ink)] mb-3">Descrição</h2>
                  <p className="text-sm text-[var(--agora-muted)] leading-relaxed whitespace-pre-line">{project.description}</p>
                </div>

                {/* Resultado da avaliação IA */}
                {aiReview && (
                  <div className="rounded-2xl border border-violet-200 bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-bold text-[var(--agora-ink)] flex items-center gap-2">
                        ✨ Avaliação por IA
                        <span className="text-xs font-normal text-[var(--agora-muted)]">sugestão automática</span>
                      </h2>
                      <span className="text-2xl font-bold text-violet-600">{aiReview.average.toFixed(1)}</span>
                    </div>
                    <div className="space-y-2.5 mb-4">
                      {([
                        ['Relevância', aiReview.relevance],
                        ['Qualidade', aiReview.quality],
                        ['Metodologia', aiReview.methodology],
                        ['Apresentação', aiReview.presentation],
                        ['Inovação', aiReview.innovation],
                      ] as [string, number][]).map(([label, value]) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[var(--agora-muted)]">{label}</span>
                            <span className="font-semibold text-[var(--agora-ink)]">{value.toFixed(1)}</span>
                          </div>
                          <div className="h-1.5 bg-[var(--agora-border)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-violet-500" style={{ width: `${(value / 10) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-[var(--agora-muted)] leading-relaxed border-t border-[var(--agora-border)] pt-4">{aiReview.feedback}</p>
                  </div>
                )}

                {/* Comentários */}
                <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]">
                  <h2 className="flex items-center gap-2 text-base font-bold text-[var(--agora-ink)] mb-5">
                    <MessageSquare size={18} />
                    Comentários ({comments.length})
                  </h2>

                  <div className="space-y-3 mb-5">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[var(--agora-accent)] flex items-center justify-center text-white font-bold text-sm">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-[var(--agora-bg)] rounded-xl px-4 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-[var(--agora-ink)]">{comment.authorName}</span>
                            <span className="text-xs text-[var(--agora-muted)]">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-[var(--agora-muted)]">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-sm text-[var(--agora-muted)]">Nenhum comentário ainda. Seja o primeiro!</p>
                    )}
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[var(--agora-accent)] flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() ?? 'A'}
                    </div>
                    <input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                      placeholder="Adicionar um comentário..."
                      className="flex-1 rounded-lg border border-[var(--agora-border)] bg-[var(--agora-input-bg)] px-4 py-2.5 text-sm text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)]"
                    />
                    <button
                      type="button"
                      onClick={handleAddComment}
                      disabled={isCommenting || !commentText.trim()}
                      className="px-4 py-2.5 bg-[var(--agora-accent)] hover:bg-[var(--agora-accent-hover)] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-5">
                {/* Detalhes */}
                <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-5 shadow-[var(--agora-shadow)]">
                  <h2 className="text-sm font-bold text-[var(--agora-ink)] mb-4">Detalhes</h2>
                  <div className="space-y-3 text-sm">
                    {project.advisor && (
                      <div>
                        <p className="text-[var(--agora-muted)] text-xs mb-0.5">Orientador</p>
                        <p className="font-semibold text-[var(--agora-ink)]">{project.advisor}</p>
                      </div>
                    )}
                    {project.area && (
                      <div>
                        <p className="text-[var(--agora-muted)] text-xs mb-0.5">Área</p>
                        <p className="font-semibold text-[var(--agora-ink)]">{project.area}</p>
                      </div>
                    )}
                    {project.course && (
                      <div>
                        <p className="text-[var(--agora-muted)] text-xs mb-0.5">Curso</p>
                        <p className="font-semibold text-[var(--agora-ink)]">{project.course}</p>
                      </div>
                    )}
                    {/* Equipe compacta com avatares + botão modal */}
                    {(project.collaborators && project.collaborators.length > 0) && (
                      <div>
                        <p className="text-[var(--agora-muted)] text-xs mb-2">Equipe</p>
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {[{ id: project.authorId, name: project.authorName, photoUrl: undefined as string | null | undefined },
                              ...(project.collaborators ?? [])]
                              .slice(0, 4)
                              .map((m, i) => (
                                <div
                                  key={m.id}
                                  className="h-7 w-7 rounded-full border-2 border-[var(--agora-panel)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                                  style={{ zIndex: 4 - i, background: i === 0 ? '#0a5c2f' : '#059669' }}
                                >
                                  {m.photoUrl
                                    ? <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                                    : m.name.charAt(0).toUpperCase()
                                  }
                                </div>
                              ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowMembersModal(true)}
                            className="text-xs font-semibold text-[var(--agora-accent)] hover:underline"
                          >
                            Ver membros
                          </button>
                        </div>
                      </div>
                    )}
                    {(!project.collaborators || project.collaborators.length === 0) && teamMembers.length > 0 && (
                      <div>
                        <p className="text-[var(--agora-muted)] text-xs mb-0.5">Equipe</p>
                        <p className="font-semibold text-[var(--agora-ink)]">{teamMembers.join(', ')}</p>
                      </div>
                    )}
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--agora-accent)] hover:underline"
                      >
                        <ExternalLink size={15} />
                        Ver no GitHub
                      </a>
                    )}
                  </div>
                </div>

                {/* Avaliação */}
                <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-5 shadow-[var(--agora-shadow)]">
                  <h2 className="text-sm font-bold text-[var(--agora-ink)] mb-4">Avaliação</h2>
                  {latestEval ? (
                    <>
                      <div className="space-y-2.5 mb-4">
                        <EvalBar label="Relevância" value={latestEval.relevance} />
                        <EvalBar label="Qualidade" value={latestEval.quality} />
                        <EvalBar label="Metodologia" value={latestEval.methodology} />
                        <EvalBar label="Apresentação" value={latestEval.presentation} />
                        <EvalBar label="Inovação" value={latestEval.innovation} />
                      </div>
                      {latestEval.feedback && (
                        <blockquote className="border-l-2 border-[var(--agora-accent)] pl-3 text-xs italic text-[var(--agora-muted)] mb-1">
                          "{latestEval.feedback}"
                        </blockquote>
                      )}
                      <p className="text-xs text-[var(--agora-muted)] mb-3">— {latestEval.professorName}</p>
                      {evaluations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setShowAllEvals(true)}
                          className="text-xs font-semibold text-[var(--agora-accent)] hover:underline"
                        >
                          Ver todas ({evaluations.length} avaliações)
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-[var(--agora-muted)] mb-3">Sem avaliações ainda.</p>
                  )}

                  {canEvaluate && !showEvaluationForm && (
                    <button
                      type="button"
                      onClick={() => setShowEvaluationForm(true)}
                      className="mt-3 w-full rounded-lg border border-[var(--agora-accent)] bg-[var(--agora-accent-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--agora-accent)] hover:bg-[var(--agora-accent)] hover:text-white transition-colors"
                    >
                      + Avaliar este projeto
                    </button>
                  )}
                  {evaluations.some(e => e.professorId === user?.id) && (
                    <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 text-center">
                      ✓ Você já avaliou este projeto.
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Views', value: project.viewCount },
                    { label: 'Downloads', value: project.downloadCount },
                    { label: 'Avaliações', value: evaluations.length }
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-3 text-center">
                      <p className="text-lg font-bold text-[var(--agora-ink)]">{new Intl.NumberFormat('pt-BR').format(stat.value)}</p>
                      <p className="text-xs text-[var(--agora-muted)]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal: formulário de avaliação */}
            {showEvaluationForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEvaluationForm(false)}>
                <div className="bg-[var(--agora-panel)] rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[var(--agora-ink)]">Nova Avaliação</h3>
                    <button onClick={() => { setShowEvaluationForm(false); setError(''); }} className="text-[var(--agora-muted)] hover:text-[var(--agora-ink)]">✕</button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    {([
                      { key: 'relevance', label: 'Relevância' },
                      { key: 'quality', label: 'Qualidade' },
                      { key: 'methodology', label: 'Metodologia' },
                      { key: 'presentation', label: 'Apresentação' },
                      { key: 'innovation', label: 'Inovação' }
                    ] as const).map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">{label} (1–10)</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={evaluationData[key] || ''}
                          onChange={e => setEvaluationData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                          className="w-full border border-[var(--agora-border)] rounded-lg px-3 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)] focus:ring-1 focus:ring-[var(--agora-accent)] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">Feedback (opcional)</label>
                    <textarea
                      rows={3}
                      value={evaluationData.feedback}
                      onChange={e => setEvaluationData(prev => ({ ...prev, feedback: e.target.value }))}
                      placeholder="Deixe um comentário sobre o projeto..."
                      className="w-full border border-[var(--agora-border)] rounded-lg px-3 py-2 text-sm resize-none bg-[var(--agora-input-bg)] text-[var(--agora-ink)] focus:ring-1 focus:ring-[var(--agora-accent)] outline-none"
                    />
                  </div>
                  {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => { setShowEvaluationForm(false); setError(''); }} className="px-4 py-2 border border-[var(--agora-border)] rounded-lg text-sm text-[var(--agora-muted)] hover:text-[var(--agora-ink)]">Cancelar</button>
                    <button
                      type="button"
                      onClick={handleSubmitEvaluation}
                      disabled={isEvaluating}
                      className="px-5 py-2 bg-[var(--agora-accent)] hover:bg-[var(--agora-accent-hover)] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      {isEvaluating ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: todas as avaliações */}
            {showAllEvals && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAllEvals(false)}>
                <div className="bg-[var(--agora-panel)] rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[var(--agora-ink)]">Todas as avaliações ({evaluations.length})</h3>
                    <button onClick={() => setShowAllEvals(false)} className="text-[var(--agora-muted)] hover:text-[var(--agora-ink)]">✕</button>
                  </div>
                  <div className="space-y-5">
                    {evaluations.map(ev => (
                      <div key={ev.id} className="rounded-xl border border-[var(--agora-border)] p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-[var(--agora-ink)]">{ev.professorName}</p>
                          <span className="text-xs text-[var(--agora-muted)]">{formatDate(ev.createdAt)}</span>
                        </div>
                        <div className="space-y-2 mb-3">
                          <EvalBar label="Relevância" value={ev.relevance} />
                          <EvalBar label="Qualidade" value={ev.quality} />
                          <EvalBar label="Metodologia" value={ev.methodology} />
                          <EvalBar label="Apresentação" value={ev.presentation} />
                          <EvalBar label="Inovação" value={ev.innovation} />
                        </div>
                        {ev.feedback && <p className="text-sm text-[var(--agora-muted)] italic mb-2">"{ev.feedback}"</p>}
                        <p className="text-sm font-semibold text-emerald-600">Média: {ev.average.toFixed(1)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!isLoading && !project && (
          <div className="mt-8 rounded-xl border border-dashed border-[var(--agora-border)] p-6 text-sm text-[var(--agora-muted)]">
            Projeto não encontrado.
          </div>
        )}

        {/* Modal de membros */}
        {showMembersModal && project && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowMembersModal(false)}>
            <div className="w-full max-w-sm rounded-2xl bg-[var(--agora-panel)] shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--agora-border)]">
                <h3 className="text-base font-bold text-[var(--agora-ink)]">Membros do projeto</h3>
                <button onClick={() => setShowMembersModal(false)} className="text-[var(--agora-muted)] hover:text-[var(--agora-ink)] transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {/* Autor */}
                <Link
                  to={`/profile/${project.authorId}`}
                  onClick={() => setShowMembersModal(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--agora-accent-bg)] transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-[#0a5c2f] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                    {project.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--agora-ink)] truncate">{project.authorName}</p>
                    {project.course && <p className="text-xs text-[var(--agora-muted)] truncate">{project.course}</p>}
                    <span className="text-xs text-[var(--agora-accent)] font-medium">Autor</span>
                  </div>
                </Link>
                {/* Colaboradores */}
                {project.collaborators?.map(c => (
                  <Link
                    key={c.id}
                    to={`/profile/${c.id}`}
                    onClick={() => setShowMembersModal(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--agora-accent-bg)] transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                      {c.photoUrl
                        ? <img src={c.photoUrl} alt={c.name} className="h-full w-full object-cover" />
                        : c.name.charAt(0).toUpperCase()
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--agora-ink)] truncate">{c.name}</p>
                      {c.course && <p className="text-xs text-[var(--agora-muted)] truncate">{c.course}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ProjectDetailsPage;
