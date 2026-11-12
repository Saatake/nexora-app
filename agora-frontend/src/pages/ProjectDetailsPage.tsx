import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import AppShell from '@/components/AppShell';
import api from '@/api/axios';
import { useProjectDetails } from '@/features/project-details/hooks/useProjectDetails';
import { useComments } from '@/features/project-details/hooks/useComments';
import { useEvaluation } from '@/features/project-details/hooks/useEvaluation';
import ProjectHeroCard from '@/features/project-details/components/ProjectHeroCard';
import AiReviewCard from '@/features/project-details/components/AiReviewCard';
import CommentsSection from '@/features/project-details/components/CommentsSection';
import ProjectSidebar from '@/features/project-details/components/ProjectSidebar';
import EvaluationFormModal from '@/features/project-details/components/EvaluationFormModal';
import AllEvaluationsModal from '@/features/project-details/components/AllEvaluationsModal';
import MembersModal from '@/features/project-details/components/MembersModal';
import ProjectContentBlocks from '@/features/project-details/components/ProjectContentBlocks';

const ProjectDetailsPage = () => {
  const navigate = useNavigate();
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [showAllEvals, setShowAllEvals] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const closeProjectPanel = useCallback(() => setShowProjectPanel(false), []);

  const {
    project, evaluations, isLoading, isDownloading,
    error, setError, projectId, canEvaluate, teamMembers,
    latestEval, user, handleDownload, refreshProjectAndEvals,
  } = useProjectDetails();

  const { comments, commentText, setCommentText, isCommenting, handleAddComment } =
    useComments(projectId);

  const isProfessor = user?.roleType === 'Professor';

  const handleAwardBadge = async (badge: string) => {
    if (!projectId) return;
    try {
      await api.post(`/projects/${projectId}/badges/${badge}`);
      refreshProjectAndEvals();
    } catch { /* silencia conflito */ }
  };

  const handleRemoveBadge = async (badge: string) => {
    if (!projectId) return;
    try {
      await api.delete(`/projects/${projectId}/badges/${badge}`);
      refreshProjectAndEvals();
    } catch { /* silencia */ }
  };

  const {
    evaluationData, setEvaluationData, isEvaluating,
    showEvaluationForm, setShowEvaluationForm, evalError, setEvalError,
    aiReview, isAiReviewing, showAiFeedback, setShowAiFeedback,
    handleSubmitEvaluation, handleAiReview,
  } = useEvaluation(projectId, refreshProjectAndEvals, setError, isProfessor);

  return (
    <AppShell title="" subtitle="" showSearch={false}>
      <div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm text-[var(--agora-muted)] transition-colors hover:text-[var(--agora-accent)]"
          >
            <ChevronLeft size={16} />
            Voltar
          </button>
          {project && (
            <button
              type="button"
              aria-controls="project-info-panel"
              aria-expanded={showProjectPanel}
              onClick={() => setShowProjectPanel((visible) => !visible)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--agora-border)] px-3 py-2 text-sm font-semibold text-[var(--agora-ink)] transition-colors hover:border-[var(--agora-accent)] hover:text-[var(--agora-accent)]"
            >
              {showProjectPanel ? <EyeOff size={16} /> : <Eye size={16} />}
              {showProjectPanel ? 'Ocultar equipe e avaliações' : 'Equipe e avaliações'}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="h-32 rounded-2xl bg-[var(--agora-border)] animate-pulse" />
            <div className="h-64 rounded-2xl bg-[var(--agora-border)] animate-pulse" />
          </div>
        )}

        {!isLoading && project && (
          <>
            <ProjectHeroCard
              project={project}
              isDownloading={isDownloading}
              isAiReviewing={isAiReviewing}
              canShowAiButton={user?.id === project.authorId}
              onDownload={handleDownload}
              onAiReview={handleAiReview}
            />

            <div className="min-w-0">
              <div className="space-y-10">
                {project.summary && (
                  <section className="max-w-5xl border-b border-[var(--agora-border)] pb-8">
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--agora-muted)]">Resumo</h2>
                    <p className="text-lg font-medium leading-8 text-[var(--agora-ink)] sm:text-xl">{project.summary}</p>
                  </section>
                )}

                <section className="max-w-5xl">
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--agora-muted)]">Sobre o projeto</h2>
                  <p className="whitespace-pre-line text-base leading-8 text-[var(--agora-ink)] sm:text-lg">
                    {project.description}
                  </p>
                </section>

                <ProjectContentBlocks blocks={project.contentBlocks} />
                {aiReview && (
                  <AiReviewCard
                    aiReview={aiReview}
                    showFeedback={showAiFeedback}
                    onToggleFeedback={() => setShowAiFeedback((v) => !v)}
                  />
                )}

                <CommentsSection
                  comments={comments}
                  userName={user?.name}
                  commentText={commentText}
                  isCommenting={isCommenting}
                  onTextChange={setCommentText}
                  onSubmit={handleAddComment}
                />
              </div>
            </div>

            {showProjectPanel && (
              <ProjectSidebar
                project={project}
                evaluations={evaluations}
                latestEval={latestEval}
                teamMembers={teamMembers}
                canEvaluate={canEvaluate}
                hasEvaluated={evaluations.some((e) => e.evaluatorId === user?.id)}
                isProfessor={isProfessor}
                onClose={closeProjectPanel}
                onShowEvaluationForm={() => { closeProjectPanel(); setShowEvaluationForm(true); }}
                onShowAllEvals={() => { closeProjectPanel(); setShowAllEvals(true); }}
                onShowMembers={() => { closeProjectPanel(); setShowMembersModal(true); }}
                onAwardBadge={isProfessor ? handleAwardBadge : undefined}
                onRemoveBadge={isProfessor ? handleRemoveBadge : undefined}
              />
            )}

            {showEvaluationForm && (
              <EvaluationFormModal
                evaluationData={evaluationData}
                isEvaluating={isEvaluating}
                isProfessor={isProfessor}
                error={evalError}
                onChange={setEvaluationData}
                onSubmit={handleSubmitEvaluation}
                onClose={() => { setShowEvaluationForm(false); setEvalError(''); }}
              />
            )}

            {showAllEvals && (
              <AllEvaluationsModal
                evaluations={evaluations}
                onClose={() => setShowAllEvals(false)}
              />
            )}

            {showMembersModal && (
              <MembersModal
                project={project}
                onClose={() => setShowMembersModal(false)}
              />
            )}
          </>
        )}

        {!isLoading && !project && (
          <div className="mt-8 rounded-xl border border-dashed border-[var(--agora-border)] p-6 text-sm text-[var(--agora-muted)]">
            Projeto não encontrado.
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ProjectDetailsPage;
