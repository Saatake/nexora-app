import { useState } from 'react';
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Trash2,
  CheckSquare,
  Square,
  ListTodo,
  ChevronRight
} from 'lucide-react';
import type { MentorshipGoal } from '@/types/mentorship';
import { GoalDetailModal } from './GoalDetailModal';

type MentorshipGoalsSectionProps = {
  goals: MentorshipGoal[];
  isProfessor: boolean;
  isStudentMember: boolean;
  onCreateGoal: (title: string, description: string, dueDate?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateGoal: (goalId: number, title: string, description: string, dueDate?: string) => Promise<{ success: boolean; error?: string }>;
  onSubmitGoal: (goalId: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  onReviewGoal: (goalId: number, approved: boolean, feedback?: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteGoal: (goalId: number) => Promise<{ success: boolean; error?: string }>;
  onCreateTask: (goalId: number, title: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  onToggleTask: (taskId: number) => Promise<{ success: boolean; error?: string }>;
  onDeleteTask: (taskId: number) => Promise<{ success: boolean; error?: string }>;
};

export const MentorshipGoalsSection = ({
  goals = [],
  isProfessor,
  isStudentMember,
  onCreateGoal,
  onUpdateGoal,
  onSubmitGoal,
  onReviewGoal,
  onDeleteGoal,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
}: MentorshipGoalsSectionProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<MentorshipGoal | null>(null);

  // Form states de criação
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  // Sincroniza o goal selecionado com a lista atualizada
  const activeGoal = selectedGoal ? (goals.find((g) => g.id === selectedGoal.id) || selectedGoal) : null;

  // Métricas consolidadas de progresso
  const totalTasks = goals.reduce((acc, g) => acc + (g.tasks?.length || 0), 0);
  const totalCompletedTasks = goals.reduce((acc, g) => acc + (g.tasks?.filter((t) => t.isCompleted).length || 0), 0);
  const completedGoalsCount = goals.filter((g) => g.status === 'Approved').length;

  const overallProgressPercent = totalTasks > 0
    ? Math.round((totalCompletedTasks / totalTasks) * 100)
    : (goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Título do marco é obrigatório.');
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
      setFormError(res.error || 'Erro ao criar marco.');
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
            Aprovado
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse">
            <Clock size={13} />
            Aguardando Parecer
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
      {/* Header & Barra de Progresso Geral do Projeto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)]">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--agora-muted)] flex items-center gap-1.5">
              <ListTodo size={14} className="text-[#0a5c2f]" />
              Progresso Geral do Projeto & Orientação
            </span>
            <span className="text-xs font-bold text-[var(--agora-ink)]">
              {totalTasks > 0
                ? `${totalCompletedTasks} de ${totalTasks} tarefas (${overallProgressPercent}%)`
                : `${completedGoalsCount} de ${goals.length} marcos (${overallProgressPercent}%)`}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[var(--agora-border)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0a5c2f] to-emerald-500 transition-all duration-500"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>

        {isProfessor && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={16} />
            Novo Marco
          </button>
        )}
      </div>

      {/* Lista de Marcos / Metas */}
      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--agora-border)] p-12 text-center bg-[var(--agora-panel)]">
          <Clock size={40} className="mx-auto text-[var(--agora-muted)] opacity-40 mb-2" />
          <h3 className="font-bold text-sm text-[var(--agora-ink)]">Nenhum marco cadastrado</h3>
          <p className="text-xs text-[var(--agora-muted)] mt-1 max-w-sm mx-auto">
            {isProfessor
              ? 'Defina marcos e entregas acadêmicas com tarefas detalhadas para orientar o ritmo de trabalho da equipe de alunos.'
              : 'Seu orientador ainda não cadastrou marcos para este projeto.'}
          </p>
          {isProfessor && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus size={15} />
              Criar Primeiro Marco
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const dueInfo = formatDueDate(goal.dueDate);
            const goalTasks = goal.tasks || [];
            const completedGoalTasks = goalTasks.filter((t) => t.isCompleted).length;
            const progress = goalTasks.length > 0
              ? Math.round((completedGoalTasks / goalTasks.length) * 100)
              : (goal.status === 'Approved' ? 100 : (goal.status === 'Submitted' ? 50 : 0));

            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-5 shadow-[var(--agora-shadow)] hover:border-[#0a5c2f] transition-all cursor-pointer hover:shadow-md"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGoal(goal.id);
                        }}
                        className="text-[var(--agora-muted)] hover:text-rose-500 transition-colors p-1"
                        title="Excluir marco"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[var(--agora-ink)] group-hover:text-[#0a5c2f] transition-colors mb-1.5 flex items-center justify-between">
                    <span>{goal.title}</span>
                    <ChevronRight size={16} className="text-[var(--agora-muted)] group-hover:translate-x-0.5 transition-transform" />
                  </h3>

                  <p className="text-xs text-[var(--agora-muted)] leading-relaxed line-clamp-2 mb-3">
                    {goal.description || 'Sem descrição detalhada.'}
                  </p>

                  {/* Barra de Progresso do Marco */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--agora-muted)] font-medium">
                        {goalTasks.length > 0
                          ? `${completedGoalTasks}/${goalTasks.length} tarefas`
                          : (goal.status === 'Approved' ? 'Concluído' : 'Sem tarefas')}
                      </span>
                      <span className="text-[var(--agora-ink)] font-bold">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--agora-border)] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0a5c2f] to-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Prévia rápida de tarefas (até 2 itens) */}
                  {goalTasks.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {goalTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isProfessor || isStudentMember) onToggleTask(task.id);
                          }}
                          className="flex items-center gap-2 text-[11px] p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          {task.isCompleted ? (
                            <CheckSquare size={13} className="text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Square size={13} className="text-[var(--agora-muted)] flex-shrink-0" />
                          )}
                          <span
                            className={`truncate ${
                              task.isCompleted
                                ? 'line-through text-[var(--agora-muted)]'
                                : 'text-[var(--agora-ink)]'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {goalTasks.length > 2 && (
                        <p className="text-[10px] text-[var(--agora-muted)] italic pl-1">
                          + {goalTasks.length - 2} outras tarefas...
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--agora-border)] mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--agora-muted)]">
                    {dueInfo ? dueInfo.text : 'Sem prazo definido'}
                  </span>

                  <span className="text-xs font-semibold text-[#0a5c2f] group-hover:underline inline-flex items-center gap-1">
                    Ver detalhes & tarefas
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar Marco */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-[var(--agora-muted)] hover:text-[var(--agora-ink)]"
            >
              <X size={18} />
            </button>
            <h2 className="text-base font-bold text-[var(--agora-ink)] mb-4">Novo Marco de Orientação</h2>

            {formError && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-1">
                  Título do Marco *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Marco 1 - Fundamentação e Arquitetura"
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
                  placeholder="Explique os objetivos acadêmicos deste marco..."
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white transition-colors"
                >
                  {isProcessing ? 'Criando...' : 'Salvar Marco'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Completo de Detalhes, Edição e Tarefas */}
      {activeGoal && (
        <GoalDetailModal
          goal={activeGoal}
          isProfessor={isProfessor}
          isStudentMember={isStudentMember}
          onClose={() => setSelectedGoal(null)}
          onUpdateGoal={onUpdateGoal}
          onCreateTask={onCreateTask}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onSubmitGoal={onSubmitGoal}
          onReviewGoal={onReviewGoal}
          onDeleteGoal={onDeleteGoal}
        />
      )}
    </div>
  );
};
