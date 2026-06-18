import AppShell from '../components/AppShell';
import ImageCropModal from '../components/ImageCropModal';
import { useProfile } from '@/features/profile/hooks/useProfile';
import ProfileHeader from '@/features/profile/components/ProfileHeader';
import ProfileProjectsList from '@/features/profile/components/ProfileProjectsList';
import ProfileSidebar from '@/features/profile/components/ProfileSidebar';
import ProfileEditModal from '@/features/profile/components/ProfileEditModal';

const ProfilePage = () => {
  const {
    profile,
    projects,
    collaboratedProjects,
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
    currentUser,
    handleEditProfile,
    handleSaveProfile,
    handlePhotoUpload,
    handlePhotoCropConfirm,
  } = useProfile();

  if (isLoading) {
    return (
      <AppShell title="Perfil" subtitle="" showSearch={false}>
        <div className="mt-8 text-center text-[var(--agora-muted)]">Carregando...</div>
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

  const roleLabel = currentUser?.roleType === 'Professor' ? 'Professor' : 'Aluno';

  return (
    <>
      <AppShell title="" subtitle="" showSearch={false}>
        <div className="mt-8 space-y-8">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            isUploadingPhoto={isUploadingPhoto}
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
                collaboratedProjects={collaboratedProjects}
              />
            </div>
            <ProfileSidebar interests={profile.interests} email={profile.email} />
          </div>

          {isEditing && (
            <ProfileEditModal
              editData={editData}
              isSaving={isSaving}
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
