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

  id: string;
  name: string;
  email: string;
  course: string;
  bio?: string;
  photoUrl?: string;
  interests?: string;
  roleType: string;
  projectCount?: number;
  averageGrade?: number;
  totalViews?: number;
};

type Project = {
  id: number;
  title: string;
  category: string;
  averageGrade?: number | null;
  createdAt: string;
  isPrivate?: boolean;
};

const formatCategory = (category: string) => {
  const lookup: Record<string, string> = {
    Tcc: 'TCC',
    Upx: 'UPX',
    IniciacaoCientifica: 'IC',
    Relatorio: 'Relatorio',
    ProjetoEscrito: 'Projeto escrito'
  };
  return lookup[category] ?? category;
};

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collaboratedProjects, setCollaboratedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    name: '',
    course: '',
    bio: '',
    photoUrl: '',
    interests: ''
  });
  const [error, setError] = useState('');
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const isOwnProfile = !id || id === currentUser?.id;
  const userId = id || currentUser?.id;

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const profileResponse = await api.get(`/users/${userId}`);

        // Se for o próprio perfil, buscar stats do dashboard
        let stats = { projectCount: 0, averageGrade: 0, totalViews: 0 };
        if (isOwnProfile) {
          try {
            const statsResponse = await api.get('/dashboard/stats');
            stats = statsResponse.data;
          } catch (err) {
            // Stats opcionais, não bloqueia
          }
        }

        // Buscar projetos
        const projectsResponse = isOwnProfile
          ? await api.get('/projects/me', { params: { page: 1, pageSize: 10 } })
          : await api.get(`/projects/user/${userId}`, { params: { page: 1, pageSize: 10 } });

        // Buscar colaborações (opcional — endpoint pode não estar disponível ainda)
        let collaborations: Project[] = [];
        try {
          const collaborationsResponse = isOwnProfile
            ? await api.get('/projects/me/collaborations', { params: { page: 1, pageSize: 10 } })
            : await api.get(`/projects/user/${userId}/collaborations`, { params: { page: 1, pageSize: 10 } });
          collaborations = collaborationsResponse.data?.items || [];
        } catch {
          // endpoint opcional, não bloqueia
        }

        if (!isMounted) return;

        setProfile({
          ...profileResponse.data,
          projectCount: stats.projectCount,
          averageGrade: stats.averageGrade,
          totalViews: stats.totalViews
        });

        setProjects(projectsResponse.data?.items || []);
        setCollaboratedProjects(collaborations);
      } catch (err) {
        if (isMounted) {
          setError('Não foi possível carregar o perfil.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userId, isOwnProfile]);

  const handleEditProfile = () => {
    if (!profile) return;
    const interests = profile.interests ? profile.interests : '';
    setEditData({
      name: profile.name,
      course: profile.course,
      bio: profile.bio || '',
      photoUrl: profile.photoUrl || '',
      interests
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    setError('');
    try {
      await api.put('/users/me', editData);

      // Recarregar perfil
      const profileResponse = await api.get(`/users/${userId}`);
      setProfile({
        ...profile,
        ...profileResponse.data
      });

      setIsEditing(false);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível atualizar o perfil.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Envie uma imagem JPG, PNG ou WEBP.');
      return;
    }

    // Open crop modal instead of direct upload
    const reader = new FileReader();
    reader.onload = (e) => setCropSrc(e.target?.result as string);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handlePhotoCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    setIsUploadingPhoto(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', blob, 'photo.jpg');

      const uploadResponse = await api.post('/uploads/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const photoUrl = uploadResponse.data.url;

      // Atualizar perfil com a nova foto
      await api.put('/users/me', {
        name: profile?.name || '',
        course: profile?.course || '',
        bio: profile?.bio || '',
        photoUrl,
        interests: profile?.interests || ''
      });

      // Recarregar perfil
      const profileResponse = await api.get(`/users/${userId}`);
      setProfile({
        ...profile!,
        ...profileResponse.data
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível fazer upload da foto.';
      setError(message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const initial = profile?.name?.trim()?.charAt(0).toUpperCase() ?? 'A';

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

  return (
    <>
      <AppShell title="" subtitle="" showSearch={false}>
        <div className="mt-8 space-y-8">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Cabeçalho com foto e info */}
          <section className="relative">
            <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] px-4 py-6 sm:px-8 sm:py-8">
              {/* Foto de perfil */}
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
                        onClick={() => fileInputRef.current?.click()}
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
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-3xl font-bold text-[var(--agora-ink)] break-words">{profile.name}</h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-[var(--agora-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <UserCircle2 className="w-4 h-4 flex-shrink-0" />
                        {currentUser?.roleType === 'Professor' ? 'Professor' : 'Aluno'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        {profile.course}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        2024
                      </span>
                    </div>
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="self-start sm:self-auto rounded-xl bg-[var(--agora-panel)] border border-[var(--agora-border)] px-4 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:border-green-800 hover:text-green-800"
                  >
                    ✏️ Editar Perfil
                  </button>
                )}
              </div>

              {/* Bio */}
              <div className="mt-6">
                <p className="text-[var(--agora-muted)]">{profile.bio || 'Sem bio cadastrada.'}</p>
              </div>

              {/* Stats - apenas para próprio perfil */}
              {isOwnProfile && profile.projectCount !== undefined && (
                <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
                  <div className="rounded-xl bg-green-50 p-3 sm:p-6 text-center">
                    <div className="text-2xl sm:text-4xl font-bold text-[#0a5c2f]">{profile.projectCount}</div>
                    <div className="mt-1 text-xs sm:text-sm text-[var(--agora-muted)]">Projetos</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 sm:p-6 text-center">
                    <div className="text-2xl sm:text-4xl font-bold text-emerald-600">{profile.averageGrade?.toFixed(1) || '0.0'}</div>
                    <div className="mt-1 text-xs sm:text-sm text-[var(--agora-muted)]">Média Geral</div>
                  </div>
                  <div className="rounded-xl bg-green-50 p-3 sm:p-6 text-center">
                    <div className="text-2xl sm:text-4xl font-bold text-[#0a5c2f]">{profile.totalViews || 0}</div>
                    <div className="mt-1 text-xs sm:text-sm text-[var(--agora-muted)]">Visualizações</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Projetos Publicados */}
              <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
                <h3 className="text-xl font-bold text-[var(--agora-ink)] mb-6">Projetos Publicados</h3>

                {projects.length === 0 ? (
                  <p className="text-center text-[var(--agora-muted)] py-8">Nenhum projeto publicado ainda</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="flex items-center gap-4 p-5 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-panel)] hover:bg-[var(--agora-accent-bg)] transition-colors"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#0a5c2f] flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-[var(--agora-ink)] truncate">{project.title}</h4>
                            {project.isPrivate && (
                              <span title="Projeto Privado" className="text-sm">
                                <Lock size={16} className="text-gray-400" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-[var(--agora-muted)]">
                            <span>{formatCategory(project.category)}</span>
                            <span>•</span>
                            <span>{new Date(project.createdAt).getFullYear()}</span>
                          </div>
                        </div>
                        {project.averageGrade && (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                            <Star className="w-5 h-5 fill-emerald-600" />
                            <span>{project.averageGrade.toFixed(1)}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Colaborações */}
              {collaboratedProjects.length > 0 && (
                <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
                  <h3 className="text-xl font-bold text-[var(--agora-ink)] mb-6">Colaborações</h3>
                  <div className="space-y-4">
                    {collaboratedProjects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="flex items-center gap-4 p-5 rounded-xl border border-[var(--agora-border)] bg-[var(--agora-panel)] hover:bg-[var(--agora-accent-bg)] transition-colors"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[var(--agora-ink)] truncate">{project.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-[var(--agora-muted)]">
                            <span>{formatCategory(project.category)}</span>
                            <span>•</span>
                            <span>{new Date(project.createdAt).getFullYear()}</span>
                          </div>
                        </div>
                        {project.averageGrade && (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                            <Star className="w-5 h-5 fill-emerald-600" />
                            <span>{project.averageGrade.toFixed(1)}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Áreas de Interesse */}
              {profile.interests && profile.interests.trim() && (
                <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
                  <h3 className="text-lg font-bold text-[var(--agora-ink)] mb-4">Áreas de Interesse</h3>
                  <div className="space-y-2">
                    {profile.interests.split(',').map((interest, index) => (
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

              {/* Contato */}
              <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
                <h3 className="text-lg font-bold text-[var(--agora-ink)] mb-4">Contato</h3>
                <div className="flex items-center gap-3 text-sm text-[var(--agora-muted)]">
                  <Mail className="w-5 h-5" />
                  <span>{profile.email}</span>
                </div>
              </section>
            </div>
          </div>

          {/* Modal de Edição */}
          {isEditing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-[var(--agora-panel)] rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[var(--agora-ink)]">Editar Perfil</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-[var(--agora-muted)] hover:text-[var(--agora-muted)]"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">Nome</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">Curso</label>
                    <input
                      type="text"
                      value={editData.course}
                      onChange={(e) => setEditData({ ...editData, course: e.target.value })}
                      className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">Bio</label>
                    <textarea
                      rows={4}
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">
                      Áreas de Interesse (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={editData.interests}
                      onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                      className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="rounded border border-[var(--agora-border)] px-6 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:bg-[var(--agora-bg)] disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="rounded bg-[#0a5c2f] px-6 py-2 text-sm font-semibold text-white hover:bg-[#084925] disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
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
