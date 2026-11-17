import { Camera, Eye, FolderKanban, GraduationCap, Pencil, Star } from 'lucide-react';
import type { UserProfile } from '../types';
import { THEMATIC_AREA_LABELS } from '@/constants/thematicAreas';
import type { ThematicArea } from '@/constants/thematicAreas';
import RoleBadge from '@/components/RoleBadge';

type ProfileHeaderProps = {
  profile: UserProfile;
  isOwnProfile: boolean;
  isUploadingPhoto: boolean;
  isProfessor: boolean;
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
  isProfessor,
  onEditClick,
  onPhotoClick,
  fileInputRef,
  onPhotoChange,
}: ProfileHeaderProps) => {
  const initial = profile.name?.trim()?.charAt(0).toUpperCase() ?? 'A';

  const stats = [
    {
      label: 'Projetos publicados',
      value: profile.projectCount ?? 0,
      icon: FolderKanban,
    },
    {
      label: 'Média geral',
      value: profile.averageGrade != null ? profile.averageGrade.toFixed(1) : '0.0',
      icon: Star,
    },
    {
      label: 'Visualizações',
      value: new Intl.NumberFormat('pt-BR').format(profile.totalViews || 0),
      icon: Eye,
    },
  ];

  return (
    <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl shadow-[var(--agora-shadow)] overflow-hidden dash-fade">
      {/* Faixa superior sutil */}
      <div className="h-2 bg-gradient-to-r from-[#063b1e] via-[#0a5c2f] to-[#18915b]" />

      {/* Conteúdo principal */}
      <div className="p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            {/* Avatar */}
            <div className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-sm flex-shrink-0">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-[#0a5c2f] to-[#063b1e] flex items-center justify-center text-white font-bold text-3xl sm:text-4xl">
                  {initial}
                </div>
              )}

              {isOwnProfile && (
                <button
                  type="button"
                  onClick={onPhotoClick}
                  disabled={isUploadingPhoto}
                  className="absolute -bottom-1.5 -right-1.5 h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#0a5c2f] text-white flex items-center justify-center hover:bg-[#084925] ring-2 ring-[var(--agora-panel)] shadow-md transition-colors disabled:opacity-50"
                  title="Alterar foto"
                >
                  {isUploadingPhoto ? (
                    <span className="text-xs font-bold">...</span>
                  ) : (
                    <Camera size={15} />
                  )}
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

            {/* Nome e metadados */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2
                  className="text-xl sm:text-3xl font-bold text-[var(--agora-ink)] break-words"
                  style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
                >
                  {profile.name}
                </h2>
                <RoleBadge role={profile.roleType} size="sm" />
              </div>

              <div className="flex items-center gap-2 mt-1.5 text-sm text-[var(--agora-muted)]">
                <GraduationCap size={15} className="text-[var(--agora-accent)] flex-shrink-0" />
                <span className="break-words">
                  {isProfessor
                    ? profile.formation || 'Formação não informada'
                    : profile.course || 'Curso não informado'}
                </span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <button
              type="button"
              onClick={onEditClick}
              className="self-start sm:self-center inline-flex items-center gap-2 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-bg)] hover:border-[var(--agora-accent)]/50 hover:text-[var(--agora-accent)] px-4 py-2 text-sm font-semibold text-[var(--agora-ink)] transition-colors flex-shrink-0"
            >
              <Pencil size={14} />
              Editar perfil
            </button>
          )}
        </div>

        {/* Áreas de ensino (professor) */}
        {isProfessor && profile.teachingAreas && profile.teachingAreas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.teachingAreas.map((area) => (
              <span
                key={area}
                className="text-xs bg-[var(--agora-accent-bg)] text-[var(--agora-accent)] border border-[var(--agora-accent)]/25 px-2.5 py-1 rounded-full font-medium"
              >
                {THEMATIC_AREA_LABELS[area as ThematicArea] ?? area}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        <div className="mt-5 pt-5 border-t border-[var(--agora-border)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--agora-muted)] mb-1.5">
            Sobre
          </p>
          {profile.bio ? (
            <p className="text-sm sm:text-base text-[var(--agora-ink)]/90 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-[var(--agora-muted)] italic">
              Nenhuma biografia adicionada ainda.
            </p>
          )}
        </div>

        {/* Estatísticas */}
        {isOwnProfile && profile.projectCount !== undefined && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3.5 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-bg)] px-4 py-3.5"
                >
                  <div className="h-10 w-10 rounded-lg bg-[var(--agora-accent-bg)] flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[var(--agora-accent)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-[var(--agora-ink)] leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-[var(--agora-muted)] truncate">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileHeader;
