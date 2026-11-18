import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Award, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import EvalBar from './EvalBar';
import BadgeDetailModal from './BadgeDetailModal';
import type { Project, Evaluation, ProjectBadge } from '../types';
import { BADGE_LABELS, BADGE_COLORS, ALL_BADGES } from '@/constants/badges';
import { formatThematicArea } from '@/shared/utils/formatters';

type ProjectSidebarProps = {
  project: Project;
  evaluations: Evaluation[];
  latestEval: Evaluation | null;
  teamMembers: string[];
  canEvaluate: boolean;
  hasEvaluated: boolean;
  isProfessor?: boolean;
  onClose: () => void;
  onShowEvaluationForm: () => void;
  onShowAllEvals: () => void;
  onShowMembers: () => void;
  onAwardBadge?: (badge: string) => void;
  onRemoveBadge?: (badge: string) => void;
};

const ProjectSidebar = ({
  project,
  evaluations,
  latestEval,
  teamMembers,
  canEvaluate,
  hasEvaluated,
  isProfessor,
  onClose,
  onShowEvaluationForm,
  onShowAllEvals,
  onShowMembers,
  onAwardBadge,
  onRemoveBadge,
}: ProjectSidebarProps) => {
  const [selectedBadge, setSelectedBadge] = useState<ProjectBadge | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel?.addEventListener('keydown', handleKeyDown);
    return () => {
      panel?.removeEventListener('keydown', handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose]);

  const existingBadgeTypes = (project.badges ?? []).map(b => b.badge);

  return createPortal(
  <>
  <button
    type="button"
    aria-label="Fechar painel de equipe e avaliações"
    onClick={onClose}
    className="fixed inset-0 z-40 cursor-default bg-black/35 backdrop-blur-[1px]"
  />
  <aside
    id="project-info-panel"
    ref={panelRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby="project-info-title"
    className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-[var(--agora-border)] bg-[var(--agora-panel)] text-[var(--agora-ink)] shadow-2xl"
  >
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--agora-border)] bg-[var(--agora-panel)] px-5 py-4">
      <h2 id="project-info-title" className="text-base font-bold">Equipe e avaliações</h2>
      <button
        ref={closeButtonRef}
        type="button"
        aria-label="Fechar painel"
        onClick={onClose}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--agora-muted)] transition-colors hover:bg-[var(--agora-bg)] hover:text-[var(--agora-ink)]"
      >
        <X size={18} />
      </button>
    </header>
    <div className="space-y-7 px-5 py-6">
    <section className="border-b border-[var(--agora-border)] pb-6">
      <h2 className="mb-4 text-sm font-bold text-[var(--agora-ink)]">Equipe do projeto</h2>
      <div className="space-y-4">
        <Link to={`/profile/${project.authorId}`} className="flex items-start gap-3 rounded-lg hover:bg-[var(--agora-bg)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a5c2f] text-sm font-bold text-white">{project.authorName.charAt(0).toUpperCase()}</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-[var(--agora-ink)]">{project.authorName} <span className="font-normal text-[var(--agora-muted)]">(autor)</span></p>{project.authorRole && <p className="text-xs font-medium text-[var(--agora-accent)]">{project.authorRole}</p>}{project.authorContribution && <p className="mt-1 text-xs leading-relaxed text-[var(--agora-muted)]">{project.authorContribution}</p>}</div>
        </Link>
        {(project.collaborators ?? []).map((member) => <Link key={member.id} to={`/profile/${member.id}`} className="flex items-start gap-3 rounded-lg hover:bg-[var(--agora-bg)]">
          {member.photoUrl ? <img src={member.photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{member.name.charAt(0).toUpperCase()}</div>}
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-[var(--agora-ink)]">{member.name}</p>{member.role && <p className="text-xs font-medium text-[var(--agora-accent)]">{member.role}</p>}{member.contribution && <p className="mt-1 text-xs leading-relaxed text-[var(--agora-muted)]">{member.contribution}</p>}</div>
        </Link>)}
        {(project.collaborators?.length ?? 0) > 0 && <button type="button" onClick={onShowMembers} className="text-xs font-semibold text-[var(--agora-accent)] hover:underline">Ver todos os integrantes</button>}
      </div>
    </section>

    {/* Detalhes */}
    <section className="border-b border-[var(--agora-border)] pb-6">
      <h2 className="text-sm font-bold text-[var(--agora-ink)] mb-4">Detalhes</h2>
      <div className="space-y-3 text-sm">
        {project.advisor && (
          <div>
            <p className="text-[var(--agora-muted)] text-xs mb-0.5">Orientador</p>
            <p className="font-semibold text-[var(--agora-ink)]">{project.advisor}</p>
          </div>
        )}
        {(project.thematicAreaName || project.thematicArea) && (
          <div>
            <p className="text-[var(--agora-muted)] text-xs mb-0.5">Área Temática</p>
            <p className="font-semibold text-[var(--agora-ink)]">{formatThematicArea(project.thematicAreaName || project.thematicArea)}</p>
          </div>
        )}
        {(project.selectedTags?.length || project.tags) && (
          <div>
            <p className="text-[var(--agora-muted)] text-xs mb-1">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {(project.selectedTags?.length ? project.selectedTags : project.tags?.split(',').map((t) => t.trim()).filter(Boolean) ?? []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-[var(--agora-accent-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--agora-accent)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {teamMembers.length > 0 && (!project.collaborators || project.collaborators.length === 0) && <div><p className="text-[var(--agora-muted)] text-xs mb-0.5">Equipe</p><p className="font-semibold text-[var(--agora-ink)]">{teamMembers.join(', ')}</p></div>}

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
    </section>

    {/* Avaliação */}
    <section className="border-b border-[var(--agora-border)] pb-6">
      <h2 className="text-sm font-bold text-[var(--agora-ink)] mb-4">Avaliação</h2>

      {(project.communityCount > 0 || project.professorCount > 0) && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="border-r border-[var(--agora-border)] pr-2">
            <p className="text-[10px] uppercase tracking-wide text-[var(--agora-muted)]">Comunidade</p>
            <p className="text-lg font-bold text-[var(--agora-ink)]">
              {project.communityAverage != null ? project.communityAverage.toFixed(1) : '—'}
            </p>
            <p className="text-[11px] text-[var(--agora-muted)]">{project.communityCount} avaliações</p>
          </div>
          <div className="pl-1">
            <p className="text-[10px] uppercase tracking-wide text-[var(--agora-accent)]">Professores</p>
            <p className="text-lg font-bold text-[var(--agora-ink)]">
              {project.professorAverage != null ? project.professorAverage.toFixed(1) : '—'}
            </p>
            <p className="text-[11px] text-[var(--agora-muted)]">{project.professorCount} avaliações</p>
          </div>
        </div>
      )}

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
          <p className="text-xs text-[var(--agora-muted)] mb-3">— {latestEval.evaluatorName}</p>
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
        <div className="mt-3 text-center text-xs font-semibold text-[var(--agora-accent)]">
          ✓ Você já avaliou este projeto.
        </div>
      )}
    </section>

    {/* Badges do projeto */}
    {(isProfessor || (project.badges && project.badges.length > 0)) && (
      <section className="border-b border-[var(--agora-border)] pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-yellow-500" />
          <h3 className="text-sm font-semibold text-[var(--agora-ink)]">Badges</h3>
        </div>

        {project.badges && project.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {(project.badges ?? []).map((b) => (
              <div key={b.badge} className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedBadge(b)}
                  className={`text-xs px-2 py-1 rounded-full border font-medium hover:opacity-80 transition-opacity ${BADGE_COLORS[b.badge] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {BADGE_LABELS[b.badge] ?? b.badge}{b.count > 1 && <span className="ml-1 opacity-70">×{b.count}</span>}
                </button>
                {isProfessor && onRemoveBadge && (
                  <button
                    onClick={() => onRemoveBadge(b.badge)}
                    className="text-gray-400 hover:text-red-500 text-xs leading-none"
                    title="Remover seu badge"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {isProfessor && onAwardBadge && (
          <div className="flex flex-wrap gap-1">
            {ALL_BADGES.filter((b) => !existingBadgeTypes.includes(b)).map((b) => (
              <button
                key={b}
                onClick={() => onAwardBadge(b)}
                className="text-xs px-2 py-1 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-[var(--agora-accent)] hover:text-[var(--agora-accent)] transition-colors"
              >
                + {BADGE_LABELS[b]}
              </button>
            ))}
            {ALL_BADGES.every((b) => existingBadgeTypes.includes(b)) && (
              <p className="text-xs text-gray-400">Todos os badges concedidos.</p>
            )}
          </div>
        )}
      </section>
    )}

    {/* Stats */}
    <div className="grid grid-cols-3 gap-3 pt-1">      {[
        { label: 'Views', value: project.viewCount },
        { label: 'Downloads', value: project.downloadCount },
        { label: 'Avaliações', value: evaluations.length },
      ].map((stat) => (
        <div
          key={stat.label}
          className="text-center"
        >
          <p className="text-lg font-bold text-[var(--agora-ink)]">
            {new Intl.NumberFormat('pt-BR').format(stat.value)}
          </p>
          <p className="text-xs text-[var(--agora-muted)]">{stat.label}</p>
        </div>
      ))}
    </div>
    </div>
  </aside>

  {selectedBadge && (
    <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
  )}
  </>,
  document.body
  );
};

export default ProjectSidebar;
