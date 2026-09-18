import { useState } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  MessageSquareQuote,
  ListTodo,
  FileText,
  CheckCheck,
  Circle
} from 'lucide-react';
import type { MentorshipGoal } from '@/types/mentorship';

type GoalDetailModalProps = {
  goal: MentorshipGoal;
  isProfessor: boolean;
  isStudentMember: boolean;
  onClose: () => void;
  onUpdateGoal: (goalId: number, title: string, description: string, dueDate?: string) => Promise<{ success: boolean; error?: string }>;
  onCreateTask: (goalId: number, title: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  onToggleTask: (taskId: number) => Promise<{ success: boolean; error?: string }>;
  onDeleteTask: (taskId: number) => Promise<{ success: boolean; error?: string }>;
  onSubmitGoal: (goalId: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  onReviewGoal: (goalId: number, approved: boolean, feedback?: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteGoal?: (goalId: number) => Promise<{ success: boolean; error?: string }>;
};

export const GoalDetailModal = ({
  goal,
  isProfessor,
  isStudentMember,
  onClose,
  onUpdateGoal,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
  onSubmitGoal,
  onReviewGoal,
}: GoalDetailModalProps) => {
  // Modo de edição do marco (título, descrição, prazo)
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editDescription, setEditDescription] = useState(goal.description);
  const [editDueDate, setEditDueDate] = useState(goal.dueDate ? goal.dueDate.substring(0, 10) : '');

  // Nova tarefa
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Submissão do aluno
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNote, setSubmissionNote] = useState(goal.studentSubmissionNote || '');

  // Revisão do orientador
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewApproved, setReviewApproved] = useState(true);
  const [reviewFeedback, setReviewFeedback] = useState(goal.professorFeedback || '');

  // Status de carregamento
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const tasks = goal.tasks || [];
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const milestoneProgress = tasks.length > 0
    ? Math.round((completedTasksCount / tasks.length) * 100)
    : (goal.status === 'Approved' ? 100 : 0);

  const handleSaveGoalEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setErrorMessage('O título do marco não pode ser vazio.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage('');
    const res = await onUpdateGoal(goal.id, editTitle.trim(), editDescription.trim(), editDueDate || undefined);
    setIsProcessing(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      setErrorMessage(res.error || 'Erro ao atualizar marco.');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsProcessing(true);
    setErrorMessage('');
    const res = await onCreateTask(goal.id, newTaskTitle.trim(), newTaskDescription.trim() || undefined);
    setIsProcessing(false);
    if (res.success) {
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(false);
    } else {
      setErrorMessage(res.error || 'Erro ao criar tarefa.');
    }
  };

  const handleToggleTask = async (taskId: number) => {
    if (!isProfessor && !isStudentMember) return;
    await onToggleTask(taskId);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!isProfessor) return;
    await onDeleteTask(taskId);
  };

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');
    const res = await onSubmitGoal(goal.id, submissionNote);
    setIsProcessing(false);
    if (res.success) {
      setIsSubmitting(false);
    } else {
      setErrorMessage(res.error || 'Erro ao submeter marco.');
    }
  };

  const handleReviewMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');
    const res = await onReviewGoal(goal.id, reviewApproved, reviewFeedback);
    setIsProcessing(false);
    if (res.success) {
      setIsReviewing(false);
    } else {
      setErrorMessage(res.error || 'Erro ao salvar parecer.');
    }
  };

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return null;
    }
  };

  const renderStatusBadge = () => {
    switch (goal.status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={14} />
            Marco Aprovado
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Clock size={14} />
            Aguardando Parecer do Orientador
          </span>
        );
      case 'NeedsRevision':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <AlertCircle size={14} />
            Revisão Necessária
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--agora-border)] text-[var(--agora-muted)]">
            <Clock size={14} />
            Em Andamento
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-[var(--agora-border)] flex items-start justify-between gap-4 bg-[var(--agora-card-bg)]">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {renderStatusBadge()}
              {goal.dueDate && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-medium bg-[var(--agora-accent-bg)] text-[var(--agora-accent)]">
                  <Calendar size={12} />
                  Prazo: {formatDueDate(goal.dueDate)}
                </span>
              )}
            </div>

            {!isEditing ? (
              <h2 className="text-lg font-bold text-[var(--agora-ink)] leading-snug">
                {goal.title}
              </h2>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {isProfessor && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--agora-border)] text-xs font-semibold text-[var(--agora-ink)] hover:border-[var(--agora-accent)] hover:text-[var(--agora-accent)] transition-colors"
                title="Editar título e descrição do marco"
              >
                <Edit2 size={13} />
                Editar Marco
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[var(--agora-muted)] hover:text-[var(--agora-ink)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Form de Edição do Marco (Professor) */}
          {isEditing ? (
            <form onSubmit={handleSaveGoalEdit} className="p-4 rounded-xl border border-[var(--agora-accent)]/40 bg-[var(--agora-card-bg)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--agora-ink)] flex items-center gap-1">
                  <Edit2 size={13} /> Editando Marco Acadêmico
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-[var(--agora-muted)] hover:underline"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--agora-muted)] mb-1">Título do Marco *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] px-3 py-2 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)]"
                  placeholder="Título do marco..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--agora-muted)] mb-1">Descrição e Requisitos</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] resize-none"
                  placeholder="Orientações detalhadas para os alunos..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--agora-muted)] mb-1">Prazo de Entrega</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] px-3 py-2 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--agora-muted)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold transition-colors"
                >
                  <Save size={13} />
                  {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          ) : (
            /* Descrição Completa do Marco */
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--agora-muted)] mb-1.5">
                Descrição e Orientações do Marco
              </h4>
              <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4 text-xs text-[var(--agora-ink)] leading-relaxed whitespace-pre-line border border-[var(--agora-border)]">
                {goal.description || 'Nenhuma descrição detalhada informada pelo orientador.'}
              </div>
            </div>
          )}

          {/* Barra de Progresso das Tarefas do Marco */}
          <div className="p-4 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-card-bg)] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--agora-ink)] flex items-center gap-1.5">
                <ListTodo size={15} className="text-[#0a5c2f]" />
                Progresso das Tarefas do Marco
              </span>
              <span className="text-[#0a5c2f] font-bold">
                {completedTasksCount} de {tasks.length} concluídas ({milestoneProgress}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--agora-border)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0a5c2f] to-emerald-500 transition-all duration-300"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
          </div>

          {/* Seção de Tarefas — Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--agora-muted)]">
                Tarefas & Entregáveis do Marco
              </h4>

              {isProfessor && !isAddingTask && (
                <button
                  type="button"
                  onClick={() => setIsAddingTask(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0a5c2f] hover:underline"
                >
                  <Plus size={14} /> Adicionar Tarefa
                </button>
              )}
            </div>

            {/* Form de nova tarefa com título + descrição */}
            {isAddingTask && (
              <form
                onSubmit={handleAddTask}
                className="rounded-xl border-2 border-dashed border-[var(--agora-accent)]/50 bg-[var(--agora-card-bg)] p-4 space-y-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Plus size={14} className="text-[#0a5c2f]" />
                  <span className="text-xs font-bold text-[var(--agora-ink)]">Nova Tarefa</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--agora-muted)] mb-1">
                    Título da Tarefa *
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Ex: Desenvolver diagrama de classes do sistema..."
                    className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] px-3 py-2 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--agora-muted)] mb-1">
                    Descrição <span className="font-normal opacity-60">(opcional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Detalhe o que deve ser entregue, critérios de aceitação, referências..."
                    className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskTitle('');
                      setNewTaskDescription('');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs text-[var(--agora-muted)] hover:text-[var(--agora-ink)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !newTaskTitle.trim()}
                    className="px-4 py-1.5 rounded-lg bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? 'Salvando...' : 'Salvar Tarefa'}
                  </button>
                </div>
              </form>
            )}

            {/* Grid de cards de tarefas */}
            {tasks.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-[var(--agora-border)] rounded-xl text-xs text-[var(--agora-muted)]">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p>Nenhuma tarefa adicionada a este marco ainda.</p>
                {isProfessor && (
                  <p
                    className="mt-1.5 font-semibold text-[#0a5c2f] cursor-pointer hover:underline"
                    onClick={() => setIsAddingTask(true)}
                  >
                    Clique aqui para adicionar a primeira tarefa.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {tasks.map((task) => {
                  const hasDescription = task.description && task.description.trim().length > 0;
                  return (
                    <div
                      key={task.id}
                      className={`group relative rounded-xl border transition-all ${
                        task.isCompleted
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-[var(--agora-border)] bg-[var(--agora-card-bg)] hover:border-[#0a5c2f]/40'
                      }`}
                    >
                      <div className="p-4">
                        {/* Cabeçalho do card: ícone de status + título + delete */}
                        <div className="flex items-start gap-3">
                          {/* Botão de toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            disabled={!isProfessor && !isStudentMember}
                            className={`flex-shrink-0 mt-0.5 transition-colors ${
                              isProfessor || isStudentMember ? 'cursor-pointer' : 'cursor-default'
                            }`}
                            title={task.isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
                          >
                            {task.isCompleted ? (
                              <CheckCheck size={18} className="text-emerald-500" />
                            ) : (
                              <Circle size={18} className="text-[var(--agora-muted)] group-hover:text-[#0a5c2f] transition-colors" />
                            )}
                          </button>

                          {/* Conteúdo principal */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold leading-snug ${
                                task.isCompleted
                                  ? 'line-through text-[var(--agora-muted)]'
                                  : 'text-[var(--agora-ink)]'
                              }`}
                            >
                              {task.title}
                            </p>

                            {hasDescription && (
                              <p
                                className={`mt-1.5 text-xs leading-relaxed ${
                                  task.isCompleted
                                    ? 'line-through text-[var(--agora-muted)] opacity-60'
                                    : 'text-[var(--agora-muted)]'
                                }`}
                              >
                                {task.description}
                              </p>
                            )}

                            {/* Badge concluído */}
                            {task.isCompleted && task.completedAt && (
                              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={11} />
                                Concluída em {new Date(task.completedAt).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>

                          {/* Botão deletar (professor) */}
                          {isProfessor && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-[var(--agora-muted)] hover:text-rose-500 p-1 transition-all"
                              title="Remover tarefa"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Linha de status no fundo do card */}
                      {task.isCompleted && (
                        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/40 to-emerald-300/20 rounded-b-xl" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção de Entrega dos Alunos */}
          {goal.studentSubmissionNote && (
            <div className="p-4 rounded-xl border border-[var(--agora-border)] bg-black/5 dark:bg-white/5 space-y-1 text-xs">
              <span className="font-bold text-[var(--agora-ink)]">Nota de Entrega dos Alunos:</span>
              <p className="text-[var(--agora-muted)] italic leading-relaxed whitespace-pre-line">
                "{goal.studentSubmissionNote}"
              </p>
            </div>
          )}

          {/* Feedback do Orientador */}
          {goal.professorFeedback && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1 text-xs">
              <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold">
                <MessageSquareQuote size={14} />
                Parecer do Professor Orientador:
              </div>
              <p className="text-[var(--agora-ink)] italic leading-relaxed whitespace-pre-line">
                "{goal.professorFeedback}"
              </p>
            </div>
          )}

          {/* Form Aluno: Submeter Marco */}
          {isSubmitting && (
            <form onSubmit={handleSubmitMilestone} className="p-4 rounded-xl border border-[var(--agora-accent)] bg-[var(--agora-card-bg)] space-y-3">
              <h5 className="text-xs font-bold text-[var(--agora-ink)]">Submeter Marco para Revisão</h5>
              <p className="text-[11px] text-[var(--agora-muted)]">
                Adicione observações, links de repositório, documentação ou notas sobre o que foi desenvolvido para este marco.
              </p>
              <textarea
                rows={3}
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                placeholder="Ex: Concluímos as tarefas previstas e o protótipo inicial está pronto..."
                className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitting(false)}
                  className="px-3 py-1.5 text-xs text-[var(--agora-muted)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 rounded-lg bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold"
                >
                  {isProcessing ? 'Enviando...' : 'Confirmar Envio'}
                </button>
              </div>
            </form>
          )}

          {/* Form Professor: Revisar Marco */}
          {isReviewing && (
            <form onSubmit={handleReviewMilestone} className="p-4 rounded-xl border border-amber-500 bg-[var(--agora-card-bg)] space-y-3">
              <h5 className="text-xs font-bold text-[var(--agora-ink)]">Parecer do Orientador</h5>

              <div className="flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    checked={reviewApproved}
                    onChange={() => setReviewApproved(true)}
                    className="accent-[#0a5c2f]"
                  />
                  <span className="text-emerald-600 dark:text-emerald-400">Aprovar Marco</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    checked={!reviewApproved}
                    onChange={() => setReviewApproved(false)}
                    className="accent-rose-500"
                  />
                  <span className="text-rose-600 dark:text-rose-400">Solicitar Ajustes</span>
                </label>
              </div>

              <div>
                <label className="block text-xs text-[var(--agora-muted)] mb-1">Comentários e Orientações</label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Escreva seu feedback pedagógico..."
                  className="w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-input-bg)] p-3 text-xs text-[var(--agora-ink)] outline-none focus:ring-1 focus:ring-[var(--agora-accent)] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewing(false)}
                  className="px-3 py-1.5 text-xs text-[var(--agora-muted)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                >
                  {isProcessing ? 'Gravando...' : 'Salvar Parecer'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--agora-border)] bg-[var(--agora-card-bg)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--agora-border)] text-[var(--agora-ink)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {isStudentMember && goal.status !== 'Approved' && !isSubmitting && (
              <button
                type="button"
                onClick={() => setIsSubmitting(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white shadow-sm transition-colors"
              >
                {goal.status === 'Submitted' ? 'Atualizar Entrega' : 'Entregar Marco'}
              </button>
            )}

            {isProfessor && goal.status === 'Submitted' && !isReviewing && (
              <button
                type="button"
                onClick={() => setIsReviewing(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors"
              >
                Emitir Parecer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
