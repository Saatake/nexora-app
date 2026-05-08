import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, Calendar, Mail, Star, UserCircle2, Upload } from 'lucide-react';
import api from '../api/axios';
import AppShell from '../components/AppShell';
import { useAuth } from '../contexts/AuthContext';

type UserProfile = {
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
          : { data: { items: [] } };

        if (!isMounted) return;

        setProfile({
          ...profileResponse.data,
          projectCount: stats.projectCount,
          averageGrade: stats.averageGrade,
          totalViews: stats.totalViews
        });

        setProjects(projectsResponse.data?.items || []);
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

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    // Validar tipo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Envie uma imagem JPG, PNG ou WEBP.');
      return;
    }

    setIsUploadingPhoto(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

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
    <AppShell title="" subtitle="" showSearch={false}>
      <div className="mt-8 space-y-8">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Cabeçalho com foto e info */}
        <section className="relative">
          <div className="rounded-3xl bg-white shadow-sm border border-slate-100 px-8 py-8">
            {/* Foto de perfil */}
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32 rounded-3xl shadow-md flex items-center justify-center">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={profile.name}
                      className="h-full w-full rounded-3xl object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-5xl">
                      {initial}
                    </div>
                  )}
                  
                  {isOwnProfile && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="absolute bottom-0 right-0 h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 shadow-lg disabled:opacity-50"
                      title="Alterar foto"
                    >
                      {isUploadingPhoto ? '...' : <Upload className="w-5 h-5" />}
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
                
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{profile.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <UserCircle2 className="w-4 h-4" />
                      {currentUser?.roleType === 'Professor' ? 'Professor' : 'Aluno'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {profile.course}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      2024
                    </span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <button
                  onClick={handleEditProfile}
                  className="rounded-2xl bg-white border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ✏️ Editar Perfil
                </button>
              )}
            </div>

            {/* Bio */}
            <div className="mt-6">
              <p className="text-slate-600">{profile.bio || 'Sem bio cadastrada.'}</p>
            </div>

            {/* Stats - apenas para próprio perfil */}
            {isOwnProfile && profile.projectCount !== undefined && (
              <div className="mt-6 grid grid-cols-3 gap-6">
                <div className="rounded-2xl bg-purple-50 p-6 text-center">
                  <div className="text-4xl font-bold text-purple-600">{profile.projectCount}</div>
                  <div className="mt-1 text-sm text-slate-600">Projetos</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-6 text-center">
                  <div className="text-4xl font-bold text-emerald-600">{profile.averageGrade?.toFixed(1) || '0.0'}</div>
                  <div className="mt-1 text-sm text-slate-600">Média Geral</div>
                </div>
                <div className="rounded-2xl bg-blue-50 p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600">{profile.totalViews || 0}</div>
                  <div className="mt-1 text-sm text-slate-600">Visualizações</div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Projetos Publicados */}
            <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Projetos Publicados</h3>
              
              {projects.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Nenhum projeto publicado ainda</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{project.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Áreas de Interesse */}
            {profile.interests && profile.interests.trim() && (
              <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Áreas de Interesse</h3>
                <div className="space-y-2">
                  {profile.interests.split(',').map((interest, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 break-words"
                    >
                      {interest.trim()}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contato */}
            <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Contato</h3>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-5 h-5" />
                <span>{profile.email}</span>
              </div>
            </section>
          </div>
        </div>

        {/* Modal de Edição */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Editar Perfil</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Curso</label>
                  <input
                    type="text"
                    value={editData.course}
                    onChange={(e) => setEditData({ ...editData, course: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Áreas de Interesse (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={editData.interests}
                    onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="rounded-xl bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ProfilePage;
