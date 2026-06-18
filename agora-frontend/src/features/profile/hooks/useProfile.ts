import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile, ProfileProject, EditData } from '../types';

export const useProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<ProfileProject[]>([]);
  const [collaboratedProjects, setCollaboratedProjects] = useState<ProfileProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    name: '',
    course: '',
    bio: '',
    photoUrl: '',
    interests: '',
  });
  const [error, setError] = useState('');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        let stats = { projectCount: 0, averageGrade: 0, totalViews: 0 };
        if (isOwnProfile) {
          try {
            const statsResponse = await api.get('/dashboard/stats');
            stats = statsResponse.data;
          } catch {
            // Stats opcionais, não bloqueia
          }
        }

        const projectsResponse = isOwnProfile
          ? await api.get('/projects/me', { params: { page: 1, pageSize: 10 } })
          : await api.get(`/projects/user/${userId}`, { params: { page: 1, pageSize: 10 } });

        let collaborations: ProfileProject[] = [];
        try {
          const collaborationsResponse = isOwnProfile
            ? await api.get('/projects/me/collaborations', { params: { page: 1, pageSize: 10 } })
            : await api.get(`/projects/user/${userId}/collaborations`, {
                params: { page: 1, pageSize: 10 },
              });
          collaborations = collaborationsResponse.data?.items || [];
        } catch {
          // endpoint opcional, não bloqueia
        }

        if (!isMounted) return;

        setProfile({ ...profileResponse.data, ...stats });
        setProjects(projectsResponse.data?.items || []);
        setCollaboratedProjects(collaborations);
      } catch {
        if (isMounted) setError('Não foi possível carregar o perfil.');
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
    setEditData({
      name: profile.name,
      course: profile.course,
      bio: profile.bio || '',
      photoUrl: profile.photoUrl || '',
      interests: profile.interests || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    setError('');
    try {
      await api.put('/users/me', editData);
      const profileResponse = await api.get(`/users/${userId}`);
      setProfile({ ...profile, ...profileResponse.data });
      setIsEditing(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Não foi possível atualizar o perfil.';
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const photoUrl = uploadResponse.data.url;
      await api.put('/users/me', {
        name: profile?.name || '',
        course: profile?.course || '',
        bio: profile?.bio || '',
        photoUrl,
        interests: profile?.interests || '',
      });
      const profileResponse = await api.get(`/users/${userId}`);
      setProfile({ ...profile!, ...profileResponse.data });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Não foi possível fazer upload da foto.';
      setError(message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return {
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
  };
};
