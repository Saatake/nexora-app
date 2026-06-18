import UserTagInput, { type CollaboratorUser } from '@/components/UserTagInput';

const inputCls =
  'w-full px-4 py-3 border border-[var(--agora-border)] rounded bg-[var(--agora-input-bg)] focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)] transition-all font-medium text-[var(--agora-ink)] placeholder:text-[var(--agora-muted)] outline-none';

type Props = {
  collaborators: CollaboratorUser[];
  setCollaborators: (v: CollaboratorUser[]) => void;
  excludeIds: string[];
  advisor: string;
  setAdvisor: (v: string) => void;
};

const ProjectFormTeam = ({ collaborators, setCollaborators, excludeIds, advisor, setAdvisor }: Props) => (
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
        <label className="text-sm font-semibold text-[var(--agora-ink)]">Professor Orientador</label>
        <input
          value={advisor}
          onChange={(e) => setAdvisor(e.target.value)}
          required
          placeholder="Ex: Prof. Dr. Joao Silva"
          className={`mt-2 ${inputCls}`}
        />
      </div>
    </div>
  </section>
);

export default ProjectFormTeam;
