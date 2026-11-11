import UserTagInput, { type CollaboratorUser } from '@/components/UserTagInput';

const inputCls =
  'w-full px-4 py-3 border border-[var(--agora-border)] rounded bg-[var(--agora-input-bg)] focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)] transition-all font-medium text-[var(--agora-ink)] placeholder:text-[var(--agora-muted)] outline-none';

type Props = {
  collaborators: CollaboratorUser[];
  setCollaborators: (v: CollaboratorUser[]) => void;
  excludeIds: string[];
  advisor: string;
  setAdvisor: (v: string) => void;
  authorContribution: string;
  setAuthorContribution: (v: string) => void;
  authorRole: string;
  setAuthorRole: (v: string) => void;
};

const roles = ['Coordenação', 'Pesquisa e investigação', 'Criação e design', 'Produção e execução', 'Desenvolvimento técnico', 'Análise', 'Comunicação e apresentação', 'Outro'];

const ProjectFormTeam = ({ collaborators, setCollaborators, excludeIds, advisor, setAdvisor, authorContribution, setAuthorContribution, authorRole, setAuthorRole }: Props) => (
  <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
    <h2 className="text-lg font-semibold">Equipe</h2>
    <div className="mt-4 space-y-4">
      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Integrantes</label>
        <div className="mt-2">
          <UserTagInput value={collaborators} onChange={setCollaborators} excludeIds={excludeIds} />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Minha função no projeto</label>
        <select value={authorRole} onChange={(event) => setAuthorRole(event.target.value)} className={`mt-2 ${inputCls}`}>
          <option value="">Selecione uma função (opcional)</option>
          {roles.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Minha contribuição</label>
        <textarea value={authorContribution} onChange={(event) => setAuthorContribution(event.target.value)} maxLength={800} rows={3} placeholder="O que você fez neste projeto?" className={`mt-2 ${inputCls}`} />
      </div>
      {collaborators.map((member) => (
        <div key={member.id} className="rounded-lg border border-[var(--agora-border)] p-4">
          <h3 className="text-sm font-bold text-[var(--agora-ink)]">{member.name}</h3>
          <label className="mt-3 block text-sm font-semibold text-[var(--agora-ink)]">Função no projeto</label>
          <select value={member.role ?? ''} onChange={(event) => setCollaborators(collaborators.map((item) => item.id === member.id ? { ...item, role: event.target.value } : item))} className={`mt-2 ${inputCls}`}>
            <option value="">Selecione uma função (opcional)</option>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <label className="mt-3 block text-sm font-semibold text-[var(--agora-ink)]">Contribuição de {member.name}</label>
          <input value={member.contribution ?? ''} maxLength={800} onChange={(event) => setCollaborators(collaborators.map((item) => item.id === member.id ? { ...item, contribution: event.target.value } : item))} placeholder="O que essa pessoa fez no projeto?" className={`mt-2 ${inputCls}`} />
        </div>
      ))}
      <div>
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Professor Orientador</label>
        <input
          value={advisor}
          onChange={(e) => setAdvisor(e.target.value)}
          placeholder="Opcional — ex.: Prof. Dr. João Silva"
          className={`mt-2 ${inputCls}`}
        />
      </div>
    </div>
  </section>
);

export default ProjectFormTeam;
