import { FACENS_COURSES } from '@/constants/facensCourses';
import type { ProjectCategory } from '../types';

const inputCls =
  'w-full px-4 py-3 border border-[var(--agora-border)] rounded bg-[var(--agora-input-bg)] focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)] transition-all font-medium text-[var(--agora-ink)] placeholder:text-[var(--agora-muted)] outline-none';

type Props = {
  title: string;
  setTitle: (v: string) => void;
  category: ProjectCategory;
  setCategory: (v: ProjectCategory) => void;
  course: string;
  setCourse: (v: string) => void;
  area: string;
  setArea: (v: string) => void;
};

const ProjectFormBasicInfo = ({
  title,
  setTitle,
  category,
  setCategory,
  course,
  setCourse,
  area,
  setArea,
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
          <label className="text-sm font-semibold text-[var(--agora-ink)]">Curso</label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className={`mt-2 ${inputCls} appearance-none`}
          >
            <option value="">Selecione o curso</option>
            {FACENS_COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Área do Conhecimento</label>
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Ex: Tecnologia da Informação"
          className={`mt-2 ${inputCls}`}
        />
      </div>
    </div>
  </section>
);

export default ProjectFormBasicInfo;
