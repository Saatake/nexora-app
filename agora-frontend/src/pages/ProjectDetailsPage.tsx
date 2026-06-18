import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import AppShell from '@/components/AppShell';
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

const ProjectDetailsPage = () => {
  const navigate = useNavigate();
  const [showAllEvals, setShowAllEvals] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const {
    project, evaluations, isLoading, isDownloading,
    error, setError, projectId, canEvaluate, teamMembers,
    latestEval, user, handleDownload, refreshProjectAndEvals,
  } = useProjectDetails();

  const { comments, commentText, setCommentText, isCommenting, handleAddComment } =
    useComments(projectId);

  const {
    evaluationData, setEvaluationData, isEvaluating,
    showEvaluationForm, setShowEvaluationForm, evalError, setEvalError,
    aiReview, isAiReviewing, showAiFeedback, setShowAiFeedback,
    handleSubmitEvaluation, handleAiReview,
  } = useEvaluation(projectId, refreshProjectAndEvals, setError);

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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {project.summary && (
                  <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]">
                    <h2 className="text-base font-bold text-[var(--agora-ink)] mb-3">Resumo</h2>
                    <p className="text-sm text-[var(--agora-muted)] leading-relaxed">{project.summary}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]">
                  <h2 className="text-base font-bold text-[var(--agora-ink)] mb-3">Descrição</h2>
                  <p className="text-sm text-[var(--agora-muted)] leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>

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

              <ProjectSidebar
                project={project}
                evaluations={evaluations}
                latestEval={latestEval}
                teamMembers={teamMembers}
                canEvaluate={canEvaluate}
                hasEvaluated={evaluations.some((e) => e.professorId === user?.id)}
                onShowEvaluationForm={() => setShowEvaluationForm(true)}
                onShowAllEvals={() => setShowAllEvals(true)}
                onShowMembers={() => setShowMembersModal(true)}
              />
            </div>

            {showEvaluationForm && (
              <EvaluationFormModal
                evaluationData={evaluationData}
                isEvaluating={isEvaluating}
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
