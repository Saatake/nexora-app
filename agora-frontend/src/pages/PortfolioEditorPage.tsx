import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Eye, EyeOff, Plus, Save, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '@/components/AppShell';
import api from '@/api/axios';

type ProjectOption = { id: number; title: string; summary?: string; description: string; imageUrl?: string | null; isPrivate: boolean };
type PortfolioData = {
  name: string; course: string; photoUrl?: string | null; slug: string; headline: string; bio: string;
  skills: string[]; theme: string; isPublished: boolean; projects: ProjectOption[];
};
type Page<T> = { items: T[] };

const blankPortfolio: PortfolioData = {
  name: '', course: '', slug: '', headline: '', bio: '', skills: [], theme: 'forest', isPublished: false, projects: [],
};

const PortfolioEditorPage = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData>(blankPortfolio);
  const [availableProjects, setAvailableProjects] = useState<ProjectOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [skillsText, setSkillsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<PortfolioData>('/portfolios/me'),
      api.get<Page<ProjectOption>>('/projects/me', { params: { page: 1, pageSize: 50 } }),
    ]).then(([portfolioResponse, projectsResponse]) => {
      if (!active) return;
      const data = portfolioResponse.data;
      setPortfolio(data);
      setSelectedIds(data.projects.map((project) => project.id));
      setSkillsText(data.skills.join(', '));
      setAvailableProjects(projectsResponse.data.items ?? []);
    }).catch(() => {
      if (active) setError('Não foi possível carregar o editor de portfólio.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const selectedProjects = useMemo(() => availableProjects.filter((project) => selectedIds.includes(project.id)), [availableProjects, selectedIds]);
  const slugValid = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(portfolio.slug);
  const publicUrl = `${window.location.origin}/portfolio/${portfolio.slug}`;

  const update = <K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) => setPortfolio((current) => ({ ...current, [key]: value }));
  const toggleProject = (id: number) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id]);

  const save = async (publish: boolean) => {
    setError(''); setNotice(''); setSaving(true);
    try {
      const response = await api.put<PortfolioData>('/portfolios/me', {
        slug: portfolio.slug.trim().toLowerCase(), headline: portfolio.headline, bio: portfolio.bio,
        skills: skillsText, theme: portfolio.theme, isPublished: publish, projectIds: selectedIds,
      });
      setPortfolio(response.data);
      setSelectedIds(response.data.projects.map((project) => project.id));
      setSkillsText(response.data.skills.join(', '));
      setNotice(publish ? 'Portfólio publicado. Seu endereço já está disponível.' : 'Rascunho salvo.');
    } catch (saveError: unknown) {
      const message = (saveError as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Não foi possível salvar. Confira o endereço e tente novamente.');
    } finally { setSaving(false); }
  };

  const generateDraft = async () => {
    if (selectedIds.length === 0) {
      setError('Selecione pelo menos um projeto para gerar sugestões.');
      return;
    }
    setError(''); setNotice(''); setGenerating(true);
    try {
      const response = await api.post<{ headline: string; bio: string; skills: string[] }>('/portfolios/me/ai-draft', { projectIds: selectedIds });
      setPortfolio((current) => ({ ...current, headline: response.data.headline, bio: response.data.bio }));
      setSkillsText(response.data.skills.join(', '));
      setNotice('Rascunho gerado. Revise as sugestões antes de salvar ou publicar.');
    } catch (draftError: unknown) {
      const message = (draftError as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Não foi possível gerar sugestões agora. Tente novamente em alguns instantes.');
    } finally { setGenerating(false); }
  };

  return (
    <AppShell title="Seu portfólio" subtitle="Monte uma página para apresentar quem você é e o que já criou." showSearch={false}>
      {loading ? <p className="mt-8 text-center text-[var(--agora-muted)]">Carregando portfólio...</p> : (
        <div className="mx-auto mt-8 max-w-4xl space-y-6 pb-12">
          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

          <section className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-card)] p-6 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16804b]">Apresentação</p><h2 className="mt-2 text-xl font-bold">Conte sobre você</h2></div>
              {portfolio.isPublished && <Link to={`/portfolio/${portfolio.slug}`} target="_blank" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a5c2f] hover:underline"><ExternalLink size={16} /> Ver página</Link>}
            </div>
            <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div><p className="font-semibold text-emerald-950">Quer ajuda para começar?</p><p className="mt-1 text-xs leading-5 text-emerald-900/75">A IA usa seus dados de perfil e os projetos selecionados para sugerir um rascunho. Revise tudo antes de publicar.</p></div>
              <button type="button" disabled={generating || selectedIds.length === 0} onClick={generateDraft} className="mt-3 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0a5c2f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#084925] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0"><Sparkles size={16} />{generating ? 'Gerando rascunho...' : 'Gerar com IA'}</button>
            </div>
            <label className="mb-2 block text-sm font-semibold">Endereço público</label>
            <div className="mb-1 flex items-center rounded-xl border border-[var(--agora-border)] bg-white px-3 focus-within:ring-2 focus-within:ring-emerald-600">
              <span className="shrink-0 text-sm text-gray-400">agora.dev.br/portfolio/</span>
              <input value={portfolio.slug} onChange={(event) => update('slug', event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} maxLength={40} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" aria-label="Nome do endereço do portfólio" />
            </div>
            <p className={`mb-5 text-xs ${slugValid ? 'text-gray-500' : 'text-rose-600'}`}>{slugValid ? 'Use letras minúsculas, números e hífens.' : 'O endereço deve ter de 3 a 40 caracteres e começar e terminar com letra ou número.'}</p>
            <label className="mb-2 block text-sm font-semibold">Título profissional</label>
            <input value={portfolio.headline} onChange={(event) => update('headline', event.target.value)} maxLength={120} placeholder="Ex.: Estudante de design apaixonada por pesquisa e impacto social" className="mb-5 w-full rounded-xl border border-[var(--agora-border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600" />
            <label className="mb-2 block text-sm font-semibold">Sobre você</label>
            <textarea value={portfolio.bio} onChange={(event) => update('bio', event.target.value)} maxLength={2000} rows={5} placeholder="Apresente sua trajetória, interesses e o tipo de problema que gosta de resolver." className="mb-1 w-full resize-y rounded-xl border border-[var(--agora-border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600" />
            <p className="mb-5 text-right text-xs text-gray-400">{portfolio.bio.length}/2000</p>
            <label className="mb-2 block text-sm font-semibold">Habilidades e interesses</label>
            <input value={skillsText} onChange={(event) => setSkillsText(event.target.value)} maxLength={1000} placeholder="Ex.: pesquisa, prototipagem, escrita, análise de dados" className="w-full rounded-xl border border-[var(--agora-border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600" />
            <p className="mt-1 text-xs text-gray-400">Separe os itens por vírgula.</p>
          </section>

          <section className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-card)] p-6 sm:p-8">
            <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16804b]">Projetos</p><h2 className="mt-2 text-xl font-bold">Escolha o que quer destacar</h2><p className="mt-1 text-sm text-[var(--agora-muted)]">Você pode selecionar até 12 projetos. Projetos privados não podem aparecer em uma página publicada.</p></div>
            {availableProjects.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center"><p className="font-semibold">Você ainda não publicou projetos</p><Link to="/projects/new" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0a5c2f]"><Plus size={16} /> Criar primeiro projeto</Link></div> : (
              <div className="grid gap-3 sm:grid-cols-2">
                {availableProjects.map((project) => {
                  const checked = selectedIds.includes(project.id);
                  return <label key={project.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${checked ? 'border-emerald-600 bg-emerald-50/50' : 'border-[var(--agora-border)] hover:border-emerald-400'}`}>
                    <input type="checkbox" checked={checked} disabled={!checked && selectedIds.length >= 12} onChange={() => toggleProject(project.id)} className="mt-1 accent-emerald-700" />
                    {project.imageUrl && <img src={project.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                    <span className="min-w-0"><span className="block font-semibold">{project.title}</span><span className="mt-1 line-clamp-2 block text-xs text-[var(--agora-muted)]">{project.summary || project.description}</span>{project.isPrivate && <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">Privado</span>}</span>
                  </label>;
                })}
              </div>
            )}
            <p className="mt-4 text-xs text-gray-500">{selectedProjects.length} de 12 selecionados</p>
          </section>

          <section className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-card)] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16804b]">Visual</p><h2 className="mb-5 mt-2 text-xl font-bold">Escolha uma identidade</h2>
            <div className="grid grid-cols-3 gap-3">
              {[{ key: 'forest', label: 'Floresta', color: '#0a5c2f' }, { key: 'ocean', label: 'Oceano', color: '#155e9b' }, { key: 'sunset', label: 'Entardecer', color: '#a34228' }].map((theme) => <button type="button" key={theme.key} onClick={() => update('theme', theme.key)} className={`rounded-xl border p-3 text-left ${portfolio.theme === theme.key ? 'border-gray-900 ring-2 ring-gray-900' : 'border-[var(--agora-border)]'}`}><span className="mb-3 block h-8 rounded-lg" style={{ backgroundColor: theme.color }} /><span className="text-sm font-semibold">{theme.label}</span></button>)}
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" disabled={saving || !slugValid} onClick={() => save(false)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--agora-border)] px-5 py-3 text-sm font-bold disabled:opacity-50"><Save size={16} />{saving ? 'Salvando...' : 'Salvar rascunho'}</button>
            <button type="button" disabled={saving || !slugValid || !portfolio.headline.trim() || !portfolio.bio.trim()} onClick={() => save(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a5c2f] px-5 py-3 text-sm font-bold text-white hover:bg-[#084925] disabled:opacity-50">{portfolio.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}{saving ? 'Publicando...' : portfolio.isPublished ? 'Salvar e manter publicado' : 'Publicar portfólio'}</button>
          </div>
          <p className="text-center text-xs text-gray-500">Rascunhos são visíveis apenas para você. Ao publicar, qualquer pessoa com o link poderá ver sua apresentação e projetos selecionados.</p>
          {portfolio.isPublished && <p className="text-center text-sm">Seu link: <a className="font-semibold text-[#0a5c2f] underline" href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a></p>}
        </div>
      )}
    </AppShell>
  );
};

export default PortfolioEditorPage;
