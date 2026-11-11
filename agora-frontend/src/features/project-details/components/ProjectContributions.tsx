import type { Project } from '../types';

const ProjectContributions = ({ project }: { project: Project }) => {
  const entries = [
    { id: project.authorId, name: project.authorName, role: 'Autoria', contribution: project.authorContribution },
    ...(project.collaborators ?? []).map((member) => ({ id: member.id, name: member.name, role: 'Colaboração', contribution: member.contribution })),
  ].filter((entry) => entry.contribution?.trim());
  if (!entries.length) return null;

  return <section className="rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] p-6 shadow-[var(--agora-shadow)]"><h2 className="mb-4 text-base font-bold text-[var(--agora-ink)]">Participações no projeto</h2><div className="space-y-4">{entries.map((entry) => <div key={entry.id}><p className="text-sm font-semibold text-[var(--agora-ink)]">{entry.name} <span className="font-normal text-[var(--agora-muted)]">· {entry.role}</span></p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[var(--agora-muted)]">{entry.contribution}</p></div>)}</div></section>;
};

export default ProjectContributions;
