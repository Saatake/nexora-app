import { THEMATIC_AREAS, THEMATIC_AREA_LABELS, type ThematicArea } from '@/constants/thematicAreas';
import type { ProjectCategory } from '../types';

const inputCls =
  'w-full px-4 py-3 border border-[var(--agora-border)] rounded bg-[var(--agora-input-bg)] focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)] transition-all font-medium text-[var(--agora-ink)] placeholder:text-[var(--agora-muted)] outline-none';

type Props = {
  title: string;
  setTitle: (v: string) => void;
  category: ProjectCategory;
  setCategory: (v: ProjectCategory) => void;
  thematicArea: ThematicArea;
  setThematicArea: (v: ThematicArea) => void;
  tags: string;
  setTags: (v: string) => void;
};

const ProjectFormBasicInfo = ({
  title,
  setTitle,
  category,
  setCategory,
  thematicArea,
  setThematicArea,
  tags,
  setTags,
}: Props) => (
  <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
    <h2 className="text-lg font-semibold">Informações Básicas</h2>
    <div className="mt-4 space-y-4">
      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Título do Projeto *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ex: Sistema de Gestão Acadêmica com IA"
          className={`mt-2 ${inputCls}`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-[var(--agora-ink)]">Tipo de Projeto *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProjectCategory)}
            className={`mt-2 ${inputCls} appearance-none`}
          >
            <option value="Tcc">TCC</option>
            <option value="Upx">UPX</option>
            <option value="IniciacaoCientifica">Iniciação Científica</option>
            <option value="Relatorio">Relatório</option>
            <option value="ProjetoEscrito">Projeto Escrito</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-[var(--agora-ink)]">Área Temática *</label>
          <select
            value={thematicArea}
            onChange={(e) => setThematicArea(e.target.value as ThematicArea)}
            required
            className={`mt-2 ${inputCls} appearance-none`}
          >
            {THEMATIC_AREAS.map((area) => (
              <option key={area} value={area}>
                {THEMATIC_AREA_LABELS[area]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Tags</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Ex: python, machine learning, api rest"
          className={`mt-2 ${inputCls}`}
        />
        <p className="mt-1 text-xs text-[var(--agora-muted)]">Separe por vírgulas. Ajuda outras pessoas a encontrarem o projeto.</p>
      </div>
    </div>
  </section>
);

export default ProjectFormBasicInfo;
