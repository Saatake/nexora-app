import { Mail, Sparkles } from 'lucide-react';

type ProfileSidebarProps = {
  interests?: string;
  email: string;
};

const ProfileSidebar = ({ interests, email }: ProfileSidebarProps) => {
  const interestList = interests
    ? interests
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {interestList.length > 0 && (
        <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl shadow-[var(--agora-shadow)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[var(--agora-accent)]" />
            <h3 className="text-base font-bold text-[var(--agora-ink)]">Áreas de Interesse</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {interestList.map((interest, index) => (
              <span
                key={`${interest}-${index}`}
                className="inline-flex items-center rounded-full bg-[var(--agora-accent-bg)] border border-[var(--agora-accent)]/25 px-3 py-1 text-xs font-medium text-[var(--agora-accent)] break-words"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl shadow-[var(--agora-shadow)] p-6">
        <h3 className="text-base font-bold text-[var(--agora-ink)] mb-4">Contato</h3>
        <div className="flex items-center gap-3 text-sm text-[var(--agora-muted)]">
          <div className="h-9 w-9 rounded-lg bg-[var(--agora-accent-bg)] flex items-center justify-center flex-shrink-0">
            <Mail size={16} className="text-[var(--agora-accent)]" />
          </div>
          <span className="break-all text-[var(--agora-ink)]/90">{email}</span>
        </div>
      </section>
    </div>
  );
};

export default ProfileSidebar;
