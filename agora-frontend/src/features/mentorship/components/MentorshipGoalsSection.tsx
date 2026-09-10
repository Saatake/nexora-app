import { useState } from 'react';
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Trash2,
  MessageSquareQuote
} from 'lucide-react';
import type { MentorshipGoal } from '@/types/mentorship';

type MentorshipGoalsSectionProps = {
  goals: MentorshipGoal[];
  isProfessor: boolean;
  isStudentMember: boolean;
  onCreateGoal: (title: string, description: string, dueDate?: string) => Promise<{ success: boolean; error?: string }>;
  onSubmitGoal: (goalId: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  onReviewGoal: (goalId: number, approved: boolean, feedback?: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteGoal: (goalId: number) => Promise<{ success: boolean; error?: string }>;
};

export const MentorshipGoalsSection = ({
  goals = [],
  isProfessor,
  isStudentMember,
  onCreateGoal,
  onSubmitGoal,
  onReviewGoal,
  onDeleteGoal,
}: MentorshipGoalsSectionProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitModalGoal, setSubmitModalGoal] = useState<MentorshipGoal | null>(null);
  const [reviewModalGoal, setReviewModalGoal] = useState<MentorshipGoal | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [reviewApproved, setReviewApproved] = useState(true);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const completedCount = goals.filter((g) => g.status === 'Approved').length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Título da meta é obrigatório.');
      return;
    }
    setIsProcessing(true);
    setFormError('');
    const res = await onCreateGoal(newTitle.trim(), newDescription.trim(), newDueDate || undefined);
    setIsProcessing(false);
    if (res.success) {
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
    } else {
      setFormError(res.error || 'Erro ao criar meta.');
    }
  };

  const handleSubmitGoalAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModalGoal) return;
    setIsProcessing(true);
    setFormError('');
    const res = await onSubmitGoal(submitModalGoal.id, submissionNote);
    setIsProcessing(false);
    if (res.success) {
      setSubmitModalGoal(null);
      setSubmissionNote('');
    } else {
      setFormError(res.error || 'Erro ao entregar meta.');
    }
  };

  const handleReviewGoalAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalGoal) return;
    setIsProcessing(true);
    setFormError('');
    const res = await onReviewGoal(reviewModalGoal.id, reviewApproved, reviewFeedback);
    setIsProcessing(false);
    if (res.success) {
      setReviewModalGoal(null);
      setReviewFeedback('');
    } else {
      setFormError(res.error || 'Erro ao revisar meta.');
    }
  };

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const formatted = date.toLocaleDateString('pt-BR');
      if (diffDays < 0) return { text: `Venceu em ${formatted}`, urgent: true, label: 'Atrasado' };
      if (diffDays === 0) return { text: `Vence hoje`, urgent: true, label: 'Hoje' };
      if (diffDays === 1) return { text: `Vence amanhã`, urgent: true, label: 'Amanhã' };
      return { text: `Prazo: ${formatted}`, urgent: false, label: `${diffDays} dias restantes` };
    } catch {
      return null;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={13} />
            Aprovada
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse">
            <Clock size={13} />
            Aguardando Revisão
          </span>
        );
      case 'NeedsRevision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <AlertCircle size={13} />
            Revisão Solicitada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--agora-border)] text-[var(--agora-muted)]">
            <Clock size={13} />
            Em Andamento
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Barra de Progresso */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)]">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--agora-muted)]">
              Progresso das Metas da Mentoria
            </span>
            <span className="text-xs font-bold text-[var(--agora-ink)]">
              {completedCount} de {goals.length} concluídas ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--agora-border)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0a5c2f] to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {isProfessor && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={16} />
            Nova Meta
          </button>
        )}
      </div>

      {/* Lista de Metas */}
      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--agora-border)] p-12 text-center bg-[var(--agora-panel)]">
          <Clock size={40} className="mx-auto text-[var(--agora-muted)] opacity-40 mb-2" />
          <h3 className="font-bold text-sm text-[var(--agora-ink)]">Nenhuma meta cadastrada</h3>
          <p className="text-xs text-[var(--agora-muted)] mt-1 max-w-sm mx-auto">
            {isProfessor
              ? 'Defina marcos e entregas acadêmicas para orientar o ritmo de trabalho da equipe de alunos.'
              : 'Seu orientador ainda não cadastrou metas para este projeto.'}
          </p>
          {isProfessor && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus size={15} />
              Criar Primeira Meta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const dueInfo = formatDueDate(goal.dueDate);
            return (
              <div
                key={goal.id}
                className="flex flex-col justify-between rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-5 shadow-[var(--agora-shadow)] hover:border-[var(--agora-accent)] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(goal.status)}
                      {dueInfo && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium ${
                            dueInfo.urgent
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold'
                              : 'bg-[var(--agora-accent-bg)] text-[var(--agora-accent)]'
                          }`}
                        >
                          <Calendar size={11} />
                          {dueInfo.label}
                        </span>
                      )}
                    </div>

                    {isProfessor && (
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="text-[var(--agora-muted)] hover:text-rose-500 transition-colors p-1"
                        title="Excluir meta"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[var(--agora-ink)] mb-1.5">{goal.title}</h3>
                  <p className="text-xs text-[var(--agora-muted)] leading-relaxed whitespace-pre-line mb-3">
                    {goal.description}
                  </p>

                  {/* Detalhes de submissão do aluno */}
                  {goal.studentSubmissionNote && (
                    <div className="mb-3 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-xs border border-[var(--agora-border)]">
                      <p className="font-semibold text-[var(--agora-ink)] mb-0.5">Nota dos Alunos:</p>
                      <p className="text-[var(--agora-muted)] italic">"{goal.studentSubmissionNote}"</p>
                    </div>
                  )}

                  {/* Feedback do professor */}
                  {goal.professorFeedback && (
                    <div className="mb-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs">
                      <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold mb-0.5">
                        <MessageSquareQuote size={13} />
                        Feedback do Orientador:
                      </div>
                      <p className="text-[var(--agora-ink)] italic">"{goal.professorFeedback}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--agora-border)] mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--agora-muted)]">
                    {dueInfo ? dueInfo.text : 'Sem prazo definido'}
                  </span>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    {isStudentMember && goal.status !== 'Approved' && (
                      <button
                        onClick={() => {
                          setSubmitModalGoal(goal);
                          setSubmissionNote(goal.studentSubmissionNote || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        {goal.status === 'Submitted' ? 'Atualizar Entrega' : 'Marcar como Entregue'}
                      </button>
                    )}

                    {isProfessor && goal.status === 'Submitted' && (
                      <button
                        onClick={() => {
                          setReviewModalGoal(goal);
                          setReviewApproved(true);
                          setReviewFeedback('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        Revisar Entrega
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar Meta */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-[var(--agora-muted)] hover:text-[var(--agora-ink)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-base font-bold text-[var(--agora-ink)] mb-4">Nova Meta de Orientação</h2>

            {formError && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
                  Título da Meta *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Entrega da Metodologia e Cronograma"
                  className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] px-3.5 py-2 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
                  Descrição e Requisitos
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explique o que os alunos devem entregar e os critérios esperados..."
                  rows={3}
                  className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
                  Data Limite de Entrega
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] px-3.5 py-2 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-[var(--agora-muted)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white disabled:opacity-50"
                >
                  {isProcessing ? 'Criando...' : 'Salvar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Entregar Meta (Aluno) */}
      {submitModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-2xl relative">
            <button
              onClick={() => setSubmitModalGoal(null)}
              className="absolute right-4 top-4 text-[var(--agora-muted)] hover:text-[var(--agora-ink)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-base font-bold text-[var(--agora-ink)] mb-1">Entregar Meta</h2>
            <p className="text-xs text-[var(--agora-muted)] mb-4">{submitModalGoal.title}</p>

            {formError && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitGoalAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
                  Notas de Entrega / Links (Opcional)
                </label>
                <textarea
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="Compartilhe links do GitHub, Docs, anotações sobre o que foi realizado..."
                  rows={4}
                  className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalGoal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-[var(--agora-muted)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white disabled:opacity-50"
                >
                  {isProcessing ? 'Enviando...' : 'Enviar para Revisão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Revisar Meta (Professor) */}
      {reviewModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-2xl relative">
            <button
              onClick={() => setReviewModalGoal(null)}
              className="absolute right-4 top-4 text-[var(--agora-muted)] hover:text-[var(--agora-ink)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-base font-bold text-[var(--agora-ink)] mb-1">Revisar Entrega dos Alunos</h2>
            <p className="text-xs text-[var(--agora-muted)] mb-4">{reviewModalGoal.title}</p>

            {reviewModalGoal.studentSubmissionNote && (
              <div className="mb-4 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-xs border border-[var(--agora-border)]">
                <p className="font-bold text-[var(--agora-ink)] mb-0.5">Nota enviada pelos alunos:</p>
                <p className="text-[var(--agora-muted)] whitespace-pre-line italic">{reviewModalGoal.studentSubmissionNote}</p>
              </div>
            )}

            {formError && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleReviewGoalAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-2">
                  Decisão de Avaliação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewApproved(true)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      reviewApproved
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'border-[var(--agora-border)] text-[var(--agora-muted)] hover:bg-black/5'
                    }`}
                  >
                    ✓ Aprovar Meta
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewApproved(false)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      !reviewApproved
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'border-[var(--agora-border)] text-[var(--agora-muted)] hover:bg-black/5'
                    }`}
                  >
                    Pedir Ajustes
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
                  Feedback para os Alunos (Opcional)
                </label>
                <textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder={
                    reviewApproved
                      ? 'Parabenize a equipe ou deixe recomendações para a próxima etapa...'
                      : 'Explique detalhadamente quais pontos precisam de revisão antes da aprovação...'
                  }
                  rows={3}
                  className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalGoal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-[var(--agora-muted)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white transition-colors ${
                    reviewApproved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? 'Salvando...' : reviewApproved ? 'Confirmar Aprovação' : 'Devolver com Ajustes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
