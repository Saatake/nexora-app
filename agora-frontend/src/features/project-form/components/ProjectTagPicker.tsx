import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import api from '@/api/axios';
import { searchProjectTags, toggleProjectTag, type ProjectTagOption } from '../projectTags';

type Props = { selected: string[]; onChange: (tags: string[]) => void };

const ProjectTagPicker = ({ selected, onChange }: Props) => {
  const [options, setOptions] = useState<ProjectTagOption[]>([]);
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/projects/tags').then(({ data }) => {
      if (active) setOptions(Array.isArray(data) ? data : []);
    }).catch(() => { if (active) setLoadError('Não foi possível carregar as tags agora.'); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => searchProjectTags(options, query), [options, query]);
  const groups = useMemo(() => [...new Set(filtered.map((option) => option.group))], [filtered]);

  return (
    <div>
      <label className="text-sm font-semibold text-[var(--agora-ink)]">Temas e assuntos</label>
      <p className="mt-1 text-xs text-[var(--agora-muted)]">Escolha termos padronizados para ajudar outras pessoas a encontrar seu projeto.</p>
      <div className="relative mt-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--agora-muted)]" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tema" className="w-full rounded-lg border border-[var(--agora-border)] bg-[var(--agora-input-bg)] py-2.5 pl-9 pr-3 text-sm" />
      </div>
      {selected.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{selected.map((tag) => <button type="button" key={tag} onClick={() => onChange(toggleProjectTag(tag, selected, options))} className="rounded-full bg-[var(--agora-accent-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--agora-accent)]">{tag} ×</button>)}</div>}
      <div className="mt-3 max-h-56 space-y-3 overflow-y-auto rounded-lg border border-[var(--agora-border)] p-3">
        {groups.map((group) => <div key={group}><p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--agora-muted)]">{group}</p><div className="flex flex-wrap gap-1.5">{filtered.filter((option) => option.group === group).map((option) => { const checked = selected.includes(option.value); return <button type="button" key={option.value} aria-pressed={checked} onClick={() => onChange(toggleProjectTag(option.value, selected, options))} className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${checked ? 'border-[var(--agora-accent)] bg-[var(--agora-accent-bg)] text-[var(--agora-accent)]' : 'border-[var(--agora-border)] text-[var(--agora-muted)] hover:border-[var(--agora-accent)]'}`}>{option.value}</button>; })}</div></div>)}
        {filtered.length === 0 && <p className="text-sm text-[var(--agora-muted)]">Nenhum tema encontrado no catálogo.</p>}
      </div>
      {loadError && <p role="alert" className="mt-2 text-xs text-rose-600">{loadError} {selected.length > 0 ? 'Suas seleções atuais foram mantidas.' : ''}</p>}
    </div>
  );
};

export default ProjectTagPicker;
