import { Mail } from 'lucide-react';

type ProfileSidebarProps = {
  interests?: string;
  email: string;
};

const ProfileSidebar = ({ interests, email }: ProfileSidebarProps) => (
  <div className="space-y-8">
    {interests && interests.trim() && (
      <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
        <h3 className="text-lg font-bold text-[var(--agora-ink)] mb-4">Áreas de Interesse</h3>
        <div className="space-y-2">
          {interests.split(',').map((interest, index) => (
            <div
              key={index}
              className="rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-[#0a5c2f] break-words"
            >
              {interest.trim()}
            </div>
          ))}
        </div>
      </section>
    )}

    <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
      <h3 className="text-lg font-bold text-[var(--agora-ink)] mb-4">Contato</h3>
      <div className="flex items-center gap-3 text-sm text-[var(--agora-muted)]">
        <Mail className="w-5 h-5" />
        <span>{email}</span>
      </div>
    </section>
  </div>
);

export default ProfileSidebar;
