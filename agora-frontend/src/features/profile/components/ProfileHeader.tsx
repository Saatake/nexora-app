import { Upload } from 'lucide-react';
import type { UserProfile } from '../types';

type ProfileHeaderProps = {
  profile: UserProfile;
  isOwnProfile: boolean;
  isUploadingPhoto: boolean;
  roleLabel: string;
  onEditClick: () => void;
  onPhotoClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ProfileHeader = ({
  profile,
  isOwnProfile,
  isUploadingPhoto,
  roleLabel,
  onEditClick,
  onPhotoClick,
  fileInputRef,
  onPhotoChange,
}: ProfileHeaderProps) => {
  const initial = profile.name?.trim()?.charAt(0).toUpperCase() ?? 'A';

  return (
    <section className="relative">
      <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative h-20 w-20 sm:h-32 sm:w-32 rounded-3xl shadow-md flex-shrink-0 flex items-center justify-center">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="h-full w-full rounded-3xl object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-3xl bg-[#0a5c2f] flex items-center justify-center text-white font-bold text-3xl sm:text-5xl">
                  {initial}
                </div>
              )}

              {isOwnProfile && (
                <button
                  onClick={onPhotoClick}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-0 right-0 h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-[#0a5c2f] text-white flex items-center justify-center hover:bg-[#084925] shadow-lg disabled:opacity-50"
                  title="Alterar foto"
                >
                  {isUploadingPhoto ? '...' : <Upload className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPhotoChange}
                className="hidden"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl sm:text-3xl font-bold text-[var(--agora-ink)] break-words">
                {profile.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-[var(--agora-muted)]">
                <span>{roleLabel}</span>
                <span>·</span>
                <span>{profile.course}</span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <button
              onClick={onEditClick}
              className="self-start sm:self-auto rounded-xl bg-[var(--agora-panel)] border border-[var(--agora-border)] px-4 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:border-green-800 hover:text-green-800"
            >
              ✏️ Editar Perfil
            </button>
          )}
        </div>

        <div className="mt-6">
          <p className="text-[var(--agora-muted)]">{profile.bio || 'Sem bio cadastrada.'}</p>
        </div>

        {isOwnProfile && profile.projectCount !== undefined && (
          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
            <div className="rounded-xl bg-green-50 p-3 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-[#0a5c2f]">
                {profile.projectCount}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-[var(--agora-muted)]">Projetos</div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-emerald-600">
                {profile.averageGrade?.toFixed(1) || '0.0'}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-[var(--agora-muted)]">Média Geral</div>
            </div>
            <div className="rounded-xl bg-green-50 p-3 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-[#0a5c2f]">
                {profile.totalViews || 0}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-[var(--agora-muted)]">Visualizações</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileHeader;
