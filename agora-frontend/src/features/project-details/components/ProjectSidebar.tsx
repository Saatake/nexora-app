import { ExternalLink } from 'lucide-react';
import EvalBar from './EvalBar';
import type { Project, Evaluation } from '../types';

type ProjectSidebarProps = {
  project: Project;
  evaluations: Evaluation[];
  latestEval: Evaluation | null;
  teamMembers: string[];
  canEvaluate: boolean;
  hasEvaluated: boolean;
  onShowEvaluationForm: () => void;
  onShowAllEvals: () => void;
  onShowMembers: () => void;
};

const ProjectSidebar = ({
  project,
  evaluations,
  latestEval,
  teamMembers,
  canEvaluate,
  hasEvaluated,
  onShowEvaluationForm,
  onShowAllEvals,
  onShowMembers,
}: ProjectSidebarProps) => (
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

        {project.collaborators && project.collaborators.length > 0 && (
          <div>
            <p className="text-[var(--agora-muted)] text-xs mb-2">Equipe</p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  {
                    id: project.authorId,
                    name: project.authorName,
                    photoUrl: undefined as string | null | undefined,
                  },
                  ...(project.collaborators ?? []),
                ]
                  .slice(0, 4)
                  .map((m, i) => (
                    <div
                      key={m.id}
                      className="h-7 w-7 rounded-full border-2 border-[var(--agora-panel)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                      style={{ zIndex: 4 - i, background: i === 0 ? '#0a5c2f' : '#059669' }}
                    >
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                      ) : (
                        m.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  ))}
              </div>
              <button
                type="button"
                onClick={onShowMembers}
                className="text-xs font-semibold text-[var(--agora-accent)] hover:underline"
              >
                Ver membros
              </button>
            </div>
          </div>
        )}

        {(!project.collaborators || project.collaborators.length === 0) &&
          teamMembers.length > 0 && (
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
              onClick={onShowAllEvals}
              className="text-xs font-semibold text-[var(--agora-accent)] hover:underline"
            >
              Ver todas ({evaluations.length} avaliações)
            </button>
          )}
        </>
      ) : (
        <p className="text-xs text-[var(--agora-muted)] mb-3">Sem avaliações ainda.</p>
      )}

      {canEvaluate && (
        <button
          type="button"
          onClick={onShowEvaluationForm}
          className="mt-3 w-full rounded-lg border border-[var(--agora-accent)] bg-[var(--agora-accent-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--agora-accent)] hover:bg-[var(--agora-accent)] hover:text-white transition-colors"
        >
          + Avaliar este projeto
        </button>
      )}
      {hasEvaluated && (
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
        { label: 'Avaliações', value: evaluations.length },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-3 text-center"
        >
          <p className="text-lg font-bold text-[var(--agora-ink)]">
            {new Intl.NumberFormat('pt-BR').format(stat.value)}
          </p>
          <p className="text-xs text-[var(--agora-muted)]">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

export default ProjectSidebar;
