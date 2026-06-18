const inputCls =
  'w-full px-4 py-3 border border-[var(--agora-border)] rounded bg-[var(--agora-input-bg)] focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)] transition-all font-medium text-[var(--agora-ink)] placeholder:text-[var(--agora-muted)] outline-none';

type Props = {
  summary: string;
  setSummary: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
};

const ProjectFormDescription = ({ summary, setSummary, description, setDescription }: Props) => (
  <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
    <h2 className="text-lg font-semibold">Descricao</h2>
    <div className="mt-4 space-y-4">
      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Resumo</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          maxLength={200}
          placeholder="Breve resumo do projeto (maximo 200 caracteres)"
          className={`mt-2 ${inputCls} resize-none`}
        />
        <p className="mt-2 text-xs text-[var(--agora-muted)]">{summary.length}/200 caracteres</p>
      </div>
      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Descricao Completa *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          required
          placeholder="Descreva detalhadamente seu projeto, metodologia, objetivos e resultados"
          className={`mt-2 ${inputCls} resize-none`}
        />
      </div>
    </div>
  </section>
);

export default ProjectFormDescription;
