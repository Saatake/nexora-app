import { useState } from 'react';
import {
  GraduationCap,
  Target,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  XCircle,
  Plus
} from 'lucide-react';
import type { Mentorship, MentorshipMessage } from '@/types/mentorship';
import { MentorshipGoalsSection } from './MentorshipGoalsSection';
import { MentorshipChatSection } from './MentorshipChatSection';
import { InviteProfessorModal } from './InviteProfessorModal';
import { OfferMentorshipModal } from './OfferMentorshipModal';

type MentorshipHubProps = {
  projectId: number;
  projectTitle: string;
  authorId: string;
  collaboratorIds: string[];
  currentUserId?: string;
  isProfessor: boolean;
  mentorship: Mentorship | null;
  messages: MentorshipMessage[];
  isLoadingMessages?: boolean;
  onRequestMentorship: (professorId?: string, message?: string) => Promise<{ success: boolean; error?: string }>;
  onAcceptMentorship: (mentorshipId: number) => Promise<{ success: boolean; error?: string }>;
  onRejectMentorship: (mentorshipId: number) => Promise<{ success: boolean; error?: string }>;
  onRevokeMentorship: (mentorshipId: number, reason?: string) => Promise<{ success: boolean; error?: string }>;
  onCreateGoal: (title: string, description: string, dueDate?: string) => Promise<{ success: boolean; error?: string }>;
  onSubmitGoal: (goalId: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  onReviewGoal: (goalId: number, approved: boolean, feedback?: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteGoal: (goalId: number) => Promise<{ success: boolean; error?: string }>;
  onSendMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
};

export const MentorshipHub = ({
  projectId: _projectId,
  projectTitle,
  authorId,
  collaboratorIds = [],
  currentUserId,
  isProfessor,
  mentorship,
  messages,
  isLoadingMessages,
  onRequestMentorship,
  onAcceptMentorship,
  onRejectMentorship,
  onRevokeMentorship,
  onCreateGoal,
  onSubmitGoal,
  onReviewGoal,
  onDeleteGoal,
  onSendMessage,
}: MentorshipHubProps) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'chat'>('goals');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  const isAuthor = currentUserId === authorId;
  const isCollab = currentUserId ? collaboratorIds.includes(currentUserId) : false;
  const isTeamMember = isAuthor || isCollab;
  const isAssignedMentor = mentorship?.professorId === currentUserId;

  const handleAccept = async () => {
    if (!mentorship) return;
    setIsProcessing(true);
    setActionError('');
    const res = await onAcceptMentorship(mentorship.id);
    setIsProcessing(false);
    if (!res.success) setActionError(res.error || 'Erro ao aceitar.');
  };

  const handleReject = async () => {
    if (!mentorship) return;
    setIsProcessing(true);
    setActionError('');
    const res = await onRejectMentorship(mentorship.id);
    setIsProcessing(false);
    if (!res.success) setActionError(res.error || 'Erro ao recusar.');
  };

  const handleRevoke = async () => {
    if (!mentorship) return;
    setIsProcessing(true);
    setActionError('');
    const res = await onRevokeMentorship(mentorship.id);
    setIsProcessing(false);
    setShowRevokeConfirm(false);
    if (!res.success) setActionError(res.error || 'Erro ao encerrar mentoria.');
  };

  const formatSinceDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  // CASO 1: SEM MENTORIA (NEM PENDENTE)
  if (!mentorship || mentorship.status === 'Rejected' || mentorship.status === 'Revoked') {
    return (
      <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-8 shadow-[var(--agora-shadow)] text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0a5c2f]/10 text-[#0a5c2f] flex items-center justify-center mb-3">
          <GraduationCap size={30} />
        </div>
        <h2 className="text-base font-bold text-[var(--agora-ink)] mb-1">
          Orientação e Mentoria Acadêmica
        </h2>
        <p className="text-xs text-[var(--agora-muted)] max-w-md mx-auto mb-6">
          A mentoria conecta o projeto a um professor especialista para acompanhar entregas, revisar metas e oferecer suporte contínuo via chat privativo.
        </p>

        {isTeamMember && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} />
            Convidar Professor Orientador
          </button>
        )}

        {isProfessor && !isTeamMember && (
          <button
            onClick={() => setShowOfferModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <GraduationCap size={16} />
            Solicitar Orientar este Projeto
          </button>
        )}

        {showInviteModal && (
          <InviteProfessorModal
            onClose={() => setShowInviteModal(false)}
            onInvite={onRequestMentorship}
          />
        )}

        {showOfferModal && (
          <OfferMentorshipModal
            projectTitle={projectTitle}
            onClose={() => setShowOfferModal(false)}
            onOffer={(msg) => onRequestMentorship(undefined, msg)}
          />
        )}
      </div>
    );
  }

  // CASO 2: SOLICITAÇÃO PENDENTE
  if (mentorship.status === 'PendingApproval') {
    const studentInvited = mentorship.initiatedBy === 'Student';
    const canAcceptOrReject =
      (studentInvited && isProfessor && mentorship.professorId === currentUserId) ||
      (!studentInvited && isTeamMember);

    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 shadow-[var(--agora-shadow)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-bold text-sm text-[var(--agora-ink)]">
                  Solicitação de Mentoria Pendente
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Aguardando Resposta
                </span>
              </div>
              <p className="text-xs text-[var(--agora-muted)] leading-relaxed">
                {studentInvited
                  ? `Os alunos convidaram o Prof. ${mentorship.professorName} para orientar este projeto.`
                  : `O Prof. ${mentorship.professorName} solicitou orientar este projeto acadêmico.`}
              </p>
              {mentorship.requestMessage && (
                <div className="mt-2.5 p-3 rounded-xl bg-[var(--agora-panel)] border border-[var(--agora-border)] text-xs text-[var(--agora-muted)] italic">
                  "{mentorship.requestMessage}"
                </div>
              )}
            </div>
          </div>

          {canAcceptOrReject && (
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--agora-border)] text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <XCircle size={15} />
                Recusar
              </button>
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a5c2f] hover:bg-[#084925] text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <UserCheck size={15} />
                Aceitar Mentoria
              </button>
            </div>
          )}
        </div>

        {actionError && (
          <p className="mt-3 text-xs text-rose-600 font-semibold">{actionError}</p>
        )}
      </div>
    );
  }

  // CASO 3: MENTORIA ATIVA
  return (
    <div className="space-y-6">
      {/* Banner Superior do Mentor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)]">
        <div className="flex items-center gap-3.5">
          {mentorship.professorPhotoUrl ? (
            <img
              src={mentorship.professorPhotoUrl}
              alt={mentorship.professorName}
              className="h-12 w-12 rounded-full object-cover border-2 border-[#0a5c2f] shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-[#0a5c2f] text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
              {mentorship.professorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[var(--agora-ink)]">
                Prof. {mentorship.professorName}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0a5c2f]/15 text-[#0a5c2f]">
                <UserCheck size={11} />
                Orientador Ativo
              </span>
            </div>
            <p className="text-xs text-[var(--agora-muted)]">
              {mentorship.professorCourse || 'Docente'} • Orientando desde {formatSinceDate(mentorship.acceptedAt)}
            </p>
          </div>
        </div>

        {/* Botão de Encerrar Mentoria */}
        {(isTeamMember || isAssignedMentor) && (
          <button
            onClick={() => setShowRevokeConfirm(true)}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
          >
            Encerrar Mentoria
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 font-semibold">
          {actionError}
        </div>
      )}

      {/* Navegação entre Abas: Metas vs Chat */}
      <div className="flex border-b border-[var(--agora-border)]">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'goals'
              ? 'border-[#0a5c2f] text-[#0a5c2f]'
              : 'border-transparent text-[var(--agora-muted)] hover:text-[var(--agora-ink)]'
          }`}
        >
          <Target size={15} />
          Metas & Entregas
          {mentorship.pendingReviewGoals > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {mentorship.pendingReviewGoals}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-[#0a5c2f] text-[#0a5c2f]'
              : 'border-transparent text-[var(--agora-muted)] hover:text-[var(--agora-ink)]'
          }`}
        >
          <MessageSquare size={15} />
          Chat da Mentoria
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[var(--agora-border)] text-[var(--agora-muted)]">
            {messages.length}
          </span>
        </button>
      </div>

      {/* Conteúdo da Aba */}
      {activeTab === 'goals' ? (
        <MentorshipGoalsSection
          goals={mentorship.goals || []}
          isProfessor={isAssignedMentor}
          isStudentMember={isTeamMember}
          onCreateGoal={onCreateGoal}
          onSubmitGoal={onSubmitGoal}
          onReviewGoal={onReviewGoal}
          onDeleteGoal={onDeleteGoal}
        />
      ) : (
        <MentorshipChatSection
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={onSendMessage}
          isLoading={isLoadingMessages}
        />
      )}

      {/* Modal Confirmação de Encerramento */}
      {showRevokeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle size={22} />
              <h3 className="font-bold text-sm text-[var(--agora-ink)]">Encerrar Mentoria do Projeto?</h3>
            </div>
            <p className="text-xs text-[var(--agora-muted)] leading-relaxed mb-5">
              Ao encerrar, o vínculo formal de orientação deste projeto será finalizado. Ambas as partes receberão uma notificação confirmando a revogação.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-[var(--agora-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRevoke}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                {isProcessing ? 'Encerrando...' : 'Confirmar Encerramento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
