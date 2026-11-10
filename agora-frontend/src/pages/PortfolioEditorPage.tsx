import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { ExternalLink, Eye, Plus, Save, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import AppShell from '@/components/AppShell';
import PortfolioRenderer from '@/features/portfolio/PortfolioRenderer';
import { normalizePortfolioDesignSpec, normalizePortfolioSkills } from '@/features/portfolio/types';
import type { Portfolio, PortfolioAiDraft, PortfolioDraft, PortfolioProject } from '@/features/portfolio/types';

type ProjectOption = Omit<PortfolioProject, 'summary' | 'thematicArea'> & {
  summary?: string | null;
  thematicAreaName: string;
  isPrivate: boolean;
};

type ProjectPage = { items: ProjectOption[]; totalPages: number };
type ProjectSource = Pick<PortfolioProject, 'id' | 'title' | 'description' | 'thematicArea' | 'category' | 'imageUrl' | 'githubLink' | 'fileUrl'>;
type ImageCounts = Pick<PortfolioAiDraft, 'imagesAnalyzed' | 'imagesUnavailable'>;
type GeneratedPreview = { draft: PortfolioDraft; portfolio: Portfolio; imageCounts?: ImageCounts };
type PendingAction = 'generate' | 'revise' | 'save' | 'publish';

const maxProjects = 12;
const maxInstruction = 1000;
const panelClass = 'rounded-2xl border border-(--agora-border) bg-(--agora-card-bg) p-5 sm:p-7';
const stepClass = 'text-xs font-bold tracking-[0.14em] text-(--agora-accent) uppercase';
const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--agora-accent) disabled:cursor-not-allowed disabled:opacity-50 active:enabled:brightness-95';
const primaryButton = `${buttonClass} bg-(--agora-accent) text-white hover:enabled:bg-(--agora-accent-hover)`;
const secondaryButton = `${buttonClass} border border-(--agora-border) text-(--agora-accent) hover:enabled:bg-(--agora-accent-bg)`;

async function loadProjectOptions() {
  const getPage = (page: number) => api.get<ProjectPage>('/projects/me', { params: { page, pageSize: 50 } });
  const { data: first } = await getPage(1);
  const remaining = await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, index) => getPage(index + 2)));
  return [...first.items, ...remaining.flatMap(({ data }) => data.items)];
}

function hasExactIds(expected: number[], actual: number[]) {
  const actualIds = new Set(actual);
  return actual.length === expected.length && actualIds.size === actual.length && expected.every((id) => actualIds.has(id));
}

function createPreview(draft: PortfolioAiDraft, portfolio: Portfolio, selectedProjects: ProjectSource[]): Portfolio {
  const selectedIds = selectedProjects.map((project) => project.id);
  if (
    !hasExactIds(selectedIds, draft.projects.map((project) => project.projectId)) ||
    !hasExactIds(selectedIds, draft.designSpec.projectCards.map((card) => card.projectId))
  ) {
    throw new Error('Os projetos do rascunho não correspondem à seleção.');
  }

  const draftsById = new Map(draft.projects.map((project) => [project.projectId, project]));

  return {
    ...portfolio,
    headline: draft.headline.trim(),
    bio: draft.bio.trim(),
    skills: normalizePortfolioSkills(draft.skills),
    theme: draft.designSpec.colors,
    designSpec: draft.designSpec,
    projects: selectedProjects.map((project) => {
      const copy = draftsById.get(project.id);
      if (!copy) throw new Error('Um projeto ficou sem texto no rascunho.');
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        thematicArea: project.thematicArea,
        category: project.category,
        imageUrl: project.imageUrl,
        githubLink: project.githubLink,
        fileUrl: project.fileUrl,
        summary: copy.summary.trim(),
        contribution: copy.contribution.trim(),
        visualSummary: copy.visualSummary.trim(),
      };
    }),
  };
}

function reopenDraft(portfolio: Portfolio | null): PortfolioDraft | null {
  if (!portfolio?.designSpec || !portfolio.headline.trim() || !portfolio.bio.trim() || !portfolio.projects.length ||
    portfolio.projects.some((project) => !project.summary.trim() || !project.contribution?.trim()) ||
    !hasExactIds(portfolio.projects.map((project) => project.id), portfolio.designSpec.projectCards.map((card) => card.projectId))) {
    return null;
  }

  return {
    headline: portfolio.headline,
    bio: portfolio.bio,
    skills: normalizePortfolioSkills(portfolio.skills),
    designSpec: portfolio.designSpec,
    designExplanation: '',
    projects: portfolio.projects.map((project) => ({
      projectId: project.id,
      summary: project.summary,
      contribution: project.contribution ?? '',
      visualSummary: project.visualSummary ?? '',
    })),
  };
}

function errorMessage(error: unknown, fallback: string) {
  return (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) || fallback;
}

const PortfolioEditorPage = () => {
  const [savedPortfolio, setSavedPortfolio] = useState<Portfolio | null>(null);
  const [availableProjects, setAvailableProjects] = useState<ProjectOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [generated, setGenerated] = useState<GeneratedPreview | null>(null);
  const [instruction, setInstruction] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [aiError, setAiError] = useState('');
  const [aiNotice, setAiNotice] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveNotice, setSaveNotice] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.get<Portfolio>('/portfolios/me'), loadProjectOptions()])
      .then(([{ data }, projects]) => {
        if (!active) return;
        setSavedPortfolio({ ...data, skills: normalizePortfolioSkills(data.skills) });
        setSlug(data.slug);
        setSelectedIds(data.projects.map((project) => project.id));
        setAvailableProjects(projects);
      })
      .catch(() => {
        if (active) setSavedPortfolio(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const savedPreview = savedPortfolio && (savedPortfolio.projects.length > 0 || savedPortfolio.headline || savedPortfolio.bio)
    ? savedPortfolio
    : null;
  const preview = generated?.portfolio ?? savedPreview;
  const revisionDraft = generated?.draft ?? reopenDraft(savedPreview);
  const selectionValid = selectedIds.length >= 1 && selectedIds.length <= maxProjects;
  const previewIds = preview?.projects.map((project) => project.id);
  const previewIsStale = !!previewIds && (
    previewIds.length !== selectedIds.length || previewIds.some((id, index) => id !== selectedIds[index])
  );
  const slugValid = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug);
  const publicPath = savedPortfolio?.isPublished ? `/portfolio/${savedPortfolio.slug}` : '';
  const publicUrl = publicPath && new URL(publicPath, window.location.origin).href;
  const canSave = !pending && !!preview && !previewIsStale && slugValid && selectedIds.length <= maxProjects;

  const toggleProject = (id: number) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((selected) => selected !== id) : [...ids, id]);
    setAiNotice('');
    setSaveNotice('');
    setSaveError('');
  };

  const generateDraft = async () => {
    if (pending || !selectionValid || !savedPortfolio) return;
    const projectsById = new Map(availableProjects.map((project) => [project.id, project]));
    const selectedProjects = selectedIds.flatMap((id) => {
      const project = projectsById.get(id);
      return project ? [{ ...project, thematicArea: project.thematicAreaName }] : [];
    });
    if (selectedProjects.length !== selectedIds.length) {
      setAiError('Um dos projetos selecionados não está disponível. Confira a seleção.');
      return;
    }

    setPending('generate');
    setAiError('');
    setAiNotice('');
    setSaveNotice('');
    setSaveError('');
    try {
      const { data } = await api.post<PortfolioAiDraft>('/portfolios/me/ai-draft', { projectIds: selectedIds });
      const draft = { ...data, skills: normalizePortfolioSkills(data.skills) };
      setGenerated({
        draft,
        portfolio: createPreview(draft, savedPortfolio, selectedProjects),
        imageCounts: { imagesAnalyzed: data.imagesAnalyzed, imagesUnavailable: data.imagesUnavailable },
      });
      setInstruction('');
      setAiNotice('Prévia pronta. Confira a apresentação antes de salvar ou publicar.');
    } catch (error) {
      setAiError(errorMessage(error, 'Não foi possível gerar o portfólio. Tente novamente em alguns instantes.'));
    } finally {
      setPending(null);
    }
  };

  const reviseDraft = async () => {
    const request = instruction.trim();
    if (pending || !revisionDraft || !preview || previewIsStale || !request || request.length > maxInstruction) return;

    setPending('revise');
    setAiError('');
    setAiNotice('');
    setSaveNotice('');
    setSaveError('');
    try {
      const { data } = await api.post<PortfolioAiDraft>('/portfolios/me/ai-revision', { draft: revisionDraft, instruction: request });
      const draft = { ...data, skills: normalizePortfolioSkills(data.skills) };
      setGenerated({
        draft,
        portfolio: createPreview(draft, preview, preview.projects),
        imageCounts: generated?.imageCounts,
      });
      setInstruction('');
      setAiNotice('Prévia revisada. Confira as mudanças antes de salvar ou publicar.');
    } catch (error) {
      setAiError(errorMessage(error, 'Não foi possível revisar o portfólio. A prévia anterior foi mantida.'));
    } finally {
      setPending(null);
    }
  };

  const save = async (publish: boolean) => {
    if (!canSave || !preview) return;
    const spec = normalizePortfolioDesignSpec(preview.designSpec);
    const variants = new Map(spec.projectCards.map((card) => [card.projectId, card.cardVariant]));
    // Legacy portfolios can have implicit standard cards.
    const designSpec = generated?.draft.designSpec ?? (hasExactIds(selectedIds, spec.projectCards.map((card) => card.projectId)) ? spec : {
      ...spec,
      projectCards: selectedIds.map((projectId) => ({ projectId, cardVariant: variants.get(projectId) ?? 'standard' })),
    });

    setPending(publish ? 'publish' : 'save');
    setSaveError('');
    setSaveNotice('');
    try {
      const { data } = await api.put<Portfolio>('/portfolios/me', {
        slug,
        headline: preview.headline,
        bio: preview.bio,
        skills: normalizePortfolioSkills(preview.skills).join(', '),
        theme: preview.theme,
        designSpec,
        isPublished: publish,
        projectIds: selectedIds,
        projectDrafts: preview.projects.map((project) => ({
          projectId: project.id,
          portfolioSummary: project.summary,
          contribution: project.contribution ?? '',
          visualSummary: project.visualSummary ?? '',
        })),
      });
      setSavedPortfolio({ ...data, skills: normalizePortfolioSkills(data.skills) });
      setSlug(data.slug);
      setSaveNotice(publish ? 'Portfólio publicado. Seu endereço já está disponível.' : 'Rascunho salvo.');
    } catch (error) {
      setSaveError(errorMessage(error, 'Não foi possível salvar. Confira o endereço e tente novamente.'));
    } finally {
      setPending(null);
    }
  };

  const availableIds = new Set(availableProjects.map((project) => project.id));
  const missingProjects = savedPortfolio?.projects.filter((project) => !availableIds.has(project.id)) ?? [];
  const projectOptions = [...availableProjects, ...missingProjects];

  return (
    <AppShell title="Seu portfólio" subtitle="Apresente seu percurso a partir dos projetos que você criou." showSearch={false}>
      {loading ? (
        <p role="status" className="mt-8 text-center text-(--agora-muted)">Carregando portfólio...</p>
      ) : !savedPortfolio ? (
        <p role="alert" className="mt-8 text-center text-sm text-rose-700">Não foi possível carregar o editor de portfólio.</p>
      ) : (
        <div className="mx-auto mt-8 max-w-6xl space-y-8 pb-12">
          <section className={panelClass} aria-labelledby="portfolio-projects">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={stepClass}>01 / Projetos</p>
                <h2 id="portfolio-projects" className="mt-2 text-xl font-bold tracking-tight">Escolha o que quer destacar</h2>
                <p className="mt-1 text-sm text-(--agora-muted)">Escolha de 1 a 12 projetos. Projetos privados só podem ficar no rascunho.</p>
              </div>
              <p className="rounded-full bg-(--agora-accent-bg) px-3 py-1 text-sm font-bold text-(--agora-accent) tabular-nums" aria-live="polite">
                {selectedIds.length} de {maxProjects} selecionados
              </p>
            </div>
            {projectOptions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-(--agora-border) p-6 text-center">
                <p className="font-semibold">Você ainda não tem projetos</p>
                <Link to="/projects/new" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-(--agora-accent) hover:underline">
                  <Plus size={16} aria-hidden="true" /> Criar primeiro projeto
                </Link>
              </div>
            ) : (
              <div className="grid max-h-96 gap-2 overflow-y-auto p-1 sm:grid-cols-2">
                {projectOptions.map((project) => {
                  const checked = selectedIds.includes(project.id);
                  const disabled = !!pending || (!checked && (!availableIds.has(project.id) || selectedIds.length >= maxProjects));
                  return (
                    <label
                      key={project.id}
                      className={`flex min-w-0 items-start gap-3 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-(--agora-accent) ${checked ? 'border-(--agora-accent) bg-(--agora-accent-bg)' : 'border-(--agora-border)'} ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-(--agora-accent)'}`}
                    >
                      <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleProject(project.id)} className="mt-1 accent-(--agora-accent)" />
                      {project.imageUrl && <img src={project.imageUrl} alt="" loading="lazy" className="size-12 shrink-0 rounded-md object-cover" />}
                      <span className="min-w-0">
                        <span className="block text-sm font-bold wrap-anywhere">{project.title}</span>
                        <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-(--agora-muted)">{project.summary || project.description}</span>
                        {'isPrivate' in project && project.isPrivate && <span className="mt-1 block text-xs font-semibold text-amber-800">Privado</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          <section className={panelClass} aria-labelledby="portfolio-draft">
            <p className={stepClass}>02 / Rascunho</p>
            <h2 id="portfolio-draft" className="mt-2 text-xl font-bold tracking-tight">Crie sua apresentação</h2>
            <p className="mt-1 text-sm text-(--agora-muted)">A partir dos projetos escolhidos, o Gemini sugere os textos e o visual da sua página.</p>
            <p id="portfolio-ai-disclosure" className="mt-4 max-w-3xl rounded-lg bg-(--agora-bg) px-4 py-3 text-sm leading-relaxed">
              <strong>Uso de dados reais no Gemini.</strong> Ao gerar, você autoriza o envio dos textos do seu perfil e dos projetos selecionados, além das capas disponíveis. No plano gratuito, o Google pode usar os prompts para melhorar seus produtos. Ao revisar, você autoriza o envio apenas do rascunho atual e do seu pedido, sem reenviar as capas.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                type="button"
                disabled={!!pending || !selectionValid}
                onClick={generateDraft}
                aria-describedby="portfolio-ai-disclosure"
                className={primaryButton}
              >
                <Sparkles size={16} aria-hidden="true" />
                {pending === 'generate' ? 'Gerando seu portfólio…' : 'Gerar meu portfólio'}
              </button>
              {!selectionValid && <p className="text-sm text-(--agora-muted)">Selecione de 1 a {maxProjects} projetos para gerar.</p>}
              {generated?.imageCounts && (
                <p className="text-xs text-(--agora-muted) tabular-nums">
                  Última geração · {generated.imageCounts.imagesAnalyzed} {generated.imageCounts.imagesAnalyzed === 1 ? 'capa analisada' : 'capas analisadas'} · {generated.imageCounts.imagesUnavailable} {generated.imageCounts.imagesUnavailable === 1 ? 'indisponível' : 'indisponíveis'}
                </p>
              )}
            </div>

            {revisionDraft && !previewIsStale && (
              <div className="mt-5 border-t border-(--agora-border) pt-5">
                <label htmlFor="portfolio-instruction" className="block text-sm font-bold">O que você quer ajustar?</label>
                <textarea
                  id="portfolio-instruction"
                  value={instruction}
                  onChange={(event) => setInstruction(event.target.value)}
                  maxLength={maxInstruction}
                  disabled={!!pending}
                  rows={3}
                  placeholder="Deixe minha apresentação mais curta e dê destaque aos projetos."
                  className="mt-2 w-full resize-y rounded-lg border border-(--agora-border) bg-(--agora-input-bg) px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-(--agora-accent) disabled:opacity-60"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={!!pending || !instruction.trim()}
                    onClick={reviseDraft}
                    aria-describedby="portfolio-ai-disclosure"
                    className={secondaryButton}
                  >
                    {pending === 'revise' ? 'Revisando prévia…' : 'Revisar prévia'}
                  </button>
                  <p className="text-xs text-(--agora-muted) tabular-nums">{instruction.length}/{maxInstruction} caracteres</p>
                </div>
              </div>
            )}
            {pending === 'generate' && <p role="status" className="mt-3 text-sm text-(--agora-muted)">Analisando os projetos e preparando a prévia…</p>}
            {pending === 'revise' && <p role="status" className="mt-3 text-sm text-(--agora-muted)">Aplicando o pedido à prévia…</p>}
            {previewIsStale && <p role="status" className="mt-3 text-sm font-semibold text-amber-800">A seleção mudou. Gere uma nova prévia para salvar ou publicar.</p>}
            {aiError && <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">{aiError}</p>}
            {aiNotice && <p role="status" className="mt-3 text-sm text-(--agora-accent)">{aiNotice}</p>}
          </section>

          <section aria-labelledby="portfolio-preview">
            <div className="mb-3 px-1">
              <p className={stepClass}>03 / Prévia</p>
              <h2 id="portfolio-preview" className="mt-2 text-xl font-bold tracking-tight">Confira sua página</h2>
              {generated?.draft.designExplanation && (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-(--agora-muted)">
                  <strong>Sobre o visual · só para você:</strong> {generated.draft.designExplanation}
                </p>
              )}
              {previewIsStale && <p className="mt-1 text-sm text-(--agora-muted)">Mostrando a prévia da seleção anterior.</p>}
            </div>
            <div className="overflow-hidden rounded-2xl border border-(--agora-border)">
              {preview ? (
                <PortfolioRenderer portfolio={preview} />
              ) : (
                <p className="bg-(--agora-card-bg) px-5 py-10 text-center text-sm text-(--agora-muted)">Sua apresentação e seus projetos aparecerão aqui após a geração.</p>
              )}
            </div>
          </section>

          <section className={panelClass} aria-labelledby="portfolio-publish">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={stepClass}>04 / Publicação</p>
                <h2 id="portfolio-publish" className="mt-2 text-xl font-bold tracking-tight">Salve ou publique</h2>
              </div>
              {publicPath && (
                <Link to={publicPath} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-(--agora-accent) hover:underline">
                  <ExternalLink size={16} aria-hidden="true" /> Ver página publicada
                </Link>
              )}
            </div>
            <label htmlFor="portfolio-slug" className="mt-5 block text-sm font-bold">Endereço público</label>
            <div className="mt-2 flex max-w-xl items-center rounded-lg border border-(--agora-border) bg-(--agora-input-bg) px-3 focus-within:ring-2 focus-within:ring-(--agora-accent)">
              <span aria-hidden="true" className="shrink-0 text-sm text-(--agora-muted)">agora.dev.br/portfolio/</span>
              <input
                id="portfolio-slug"
                value={slug}
                onChange={(event) => {
                  setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  setSaveNotice('');
                  setSaveError('');
                }}
                maxLength={40}
                disabled={!!pending}
                aria-invalid={!slugValid}
                aria-describedby="portfolio-slug-hint"
                className="min-h-11 min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
            <p id="portfolio-slug-hint" className={`mt-2 text-xs ${slugValid ? 'text-(--agora-muted)' : 'text-rose-700'}`}>
              Use de 3 a 40 letras minúsculas, números ou hífens. Comece e termine com letra ou número.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-(--agora-muted)">Rascunhos são visíveis apenas para você. Ao publicar, qualquer pessoa com o link poderá ver sua apresentação e os projetos selecionados.</p>
            {saveError && <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">{saveError}</p>}
            {saveNotice && <p role="status" className="mt-3 text-sm text-(--agora-accent)">{saveNotice}</p>}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" disabled={!canSave} onClick={() => save(false)} className={secondaryButton}>
                <Save size={16} aria-hidden="true" /> {pending === 'save' ? 'Salvando…' : 'Salvar rascunho'}
              </button>
              <button type="button" disabled={!canSave || !preview?.headline.trim() || !preview?.bio.trim()} onClick={() => save(true)} className={primaryButton}>
                <Eye size={16} aria-hidden="true" />
                {pending === 'publish' ? 'Publicando…' : publicPath ? 'Salvar e manter publicado' : 'Publicar portfólio'}
              </button>
            </div>
            {publicUrl && (
              <p className="mt-4 text-sm wrap-anywhere"><a className="font-bold text-(--agora-accent) underline" href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a></p>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
};

export default PortfolioEditorPage;
