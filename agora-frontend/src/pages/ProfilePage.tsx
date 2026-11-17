import AppShell from '../components/AppShell';
import ImageCropModal from '../components/ImageCropModal';
import { useProfile } from '@/features/profile/hooks/useProfile';
import ProfileHeader from '@/features/profile/components/ProfileHeader';
import ProfileProjectsList from '@/features/profile/components/ProfileProjectsList';
import ProfileSidebar from '@/features/profile/components/ProfileSidebar';
import ProfileEditModal from '@/features/profile/components/ProfileEditModal';

const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header skeleton */}
    <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl overflow-hidden">
      <div className="h-2 bg-[var(--agora-border)]" />
      <div className="p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl bg-[var(--agora-border)]/70 flex-shrink-0" />
            <div className="space-y-2.5">
              <div className="h-7 w-48 sm:w-64 rounded-lg bg-[var(--agora-border)]/70" />
              <div className="h-4 w-36 sm:w-44 rounded bg-[var(--agora-border)]/50" />
            </div>
          </div>
          <div className="h-9 w-32 rounded-xl bg-[var(--agora-border)]/60" />
        </div>

        <div className="pt-5 border-t border-[var(--agora-border)] space-y-2">
          <div className="h-3 w-14 rounded bg-[var(--agora-border)]/50" />
          <div className="h-4 w-full max-w-xl rounded bg-[var(--agora-border)]/60" />
          <div className="h-4 w-2/3 max-w-md rounded bg-[var(--agora-border)]/50" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-bg)]"
            />
          ))}
        </div>
      </div>
    </div>

    {/* Body skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl p-6 space-y-4">
        <div className="h-6 w-44 rounded bg-[var(--agora-border)]/70" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-bg)]/40"
          />
        ))}
      </div>
      <div className="space-y-6">
        <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl p-6 space-y-3">
          <div className="h-5 w-36 rounded bg-[var(--agora-border)]/70" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-7 w-24 rounded-full bg-[var(--agora-border)]/60" />
            ))}
          </div>
        </div>
        <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl p-6 space-y-3">
          <div className="h-5 w-24 rounded bg-[var(--agora-border)]/70" />
          <div className="h-9 w-full rounded-lg bg-[var(--agora-border)]/50" />
        </div>
      </div>
    </div>
  </div>
);

const ProfilePage = () => {
  const {
    profile,
    projects,
    projectsPage,
    projectsTotalPages,
    projectsTotalCount,
    isLoadingProjects,
    handleProjectsPageChange,
    collaboratedProjects,
    collabPage,
    collabTotalPages,
    collabTotalCount,
    isLoadingCollabs,
    handleCollabPageChange,
    isLoading,
    isEditing,
    setIsEditing,
    isSaving,
    isUploadingPhoto,
    editData,
    setEditData,
    error,
    cropSrc,
    setCropSrc,
    fileInputRef,
    isOwnProfile,
    handleEditProfile,
    handleSaveProfile,
    handlePhotoUpload,
    handlePhotoCropConfirm,
  } = useProfile();

  if (isLoading) {
    return (
      <AppShell
        title={isOwnProfile ? 'Meu Perfil' : 'Perfil'}
        subtitle={isOwnProfile ? 'Gerencie suas informações acadêmicas e projetos' : undefined}
        showSearch={false}
      >
        <ProfileSkeleton />
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell title="Perfil" subtitle="" showSearch={false}>
        <div className="mt-8 text-center text-red-500">Perfil não encontrado.</div>
      </AppShell>
    );
  }

  const isProfessor = profile.roleType === 'Professor';
  const roleLabel = isProfessor ? 'Professor' : 'Aluno';

  return (
    <>
      <AppShell
        title={isOwnProfile ? 'Meu Perfil' : 'Perfil'}
        subtitle={isOwnProfile ? 'Gerencie suas informações acadêmicas e projetos' : undefined}
        showSearch={false}
      >
        <div className="space-y-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            isUploadingPhoto={isUploadingPhoto}
            isProfessor={isProfessor}
            roleLabel={roleLabel}
            onEditClick={handleEditProfile}
            onPhotoClick={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onPhotoChange={handlePhotoUpload}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ProfileProjectsList
                projects={projects}
                projectsPage={projectsPage}
                projectsTotalPages={projectsTotalPages}
                projectsTotalCount={projectsTotalCount}
                isLoadingProjects={isLoadingProjects}
                onProjectsPageChange={handleProjectsPageChange}
                collaboratedProjects={collaboratedProjects}
                collabPage={collabPage}
                collabTotalPages={collabTotalPages}
                collabTotalCount={collabTotalCount}
                isLoadingCollabs={isLoadingCollabs}
                onCollabPageChange={handleCollabPageChange}
              />
            </div>
            <ProfileSidebar interests={profile.interests} email={profile.email} />
          </div>

          {isEditing && (
            <ProfileEditModal
              editData={editData}
              isSaving={isSaving}
              isProfessor={isProfessor}
              onChange={setEditData}
              onSave={handleSaveProfile}
              onClose={() => setIsEditing(false)}
            />
          )}
        </div>
      </AppShell>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={1}
          onConfirm={handlePhotoCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </>
  );
};

export default ProfilePage;
