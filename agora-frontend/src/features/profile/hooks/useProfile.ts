import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { THEMATIC_AREA_ENUM } from '@/constants/thematicAreas';
import { normalizeCourseName } from '@/constants/facensCourses';
import type { UserProfile, ProfileProject, EditData } from '../types';

export const useProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<ProfileProject[]>([]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsTotalPages, setProjectsTotalPages] = useState(1);
  const [projectsTotalCount, setProjectsTotalCount] = useState(0);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const [collaboratedProjects, setCollaboratedProjects] = useState<ProfileProject[]>([]);
  const [collabPage, setCollabPage] = useState(1);
  const [collabTotalPages, setCollabTotalPages] = useState(1);
  const [collabTotalCount, setCollabTotalCount] = useState(0);
  const [isLoadingCollabs, setIsLoadingCollabs] = useState(false);

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
    formation: '',
    teachingAreas: [],
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
          ? await api.get('/projects/me', { params: { page: 1, pageSize: 5 } })
          : await api.get(`/projects/user/${userId}`, { params: { page: 1, pageSize: 5 } });

        let collaborations: ProfileProject[] = [];
        let collabPages = 1;
        let collabTotal = 0;
        try {
          const collaborationsResponse = isOwnProfile
            ? await api.get('/projects/me/collaborations', { params: { page: 1, pageSize: 5 } })
            : await api.get(`/projects/user/${userId}/collaborations`, {
                params: { page: 1, pageSize: 5 },
              });
          collaborations = collaborationsResponse.data?.items || [];
          collabPages = collaborationsResponse.data?.totalPages ?? 1;
          collabTotal = collaborationsResponse.data?.totalCount ?? collaborations.length;
        } catch {
          // endpoint opcional, não bloqueia
        }

        if (!isMounted) return;

        setProfile({ ...profileResponse.data, ...stats });
        setProjects(projectsResponse.data?.items || []);
        setProjectsPage(1);
        setProjectsTotalPages(projectsResponse.data?.totalPages ?? 1);
        setProjectsTotalCount(projectsResponse.data?.totalCount ?? (projectsResponse.data?.items?.length || 0));
        setCollaboratedProjects(collaborations);
        setCollabPage(1);
        setCollabTotalPages(collabPages);
        setCollabTotalCount(collabTotal);
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
      course: normalizeCourseName(profile.course),
      bio: profile.bio || '',
      photoUrl: profile.photoUrl || '',
      interests: profile.interests || '',
      formation: profile.formation || '',
      teachingAreas: profile.teachingAreas || [],
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    setError('');
    try {
      await api.put('/users/me', editData);
      if (profile.roleType === 'Professor') {
        const areaNumbers = editData.teachingAreas
          .map((a) => THEMATIC_AREA_ENUM[a as keyof typeof THEMATIC_AREA_ENUM])
          .filter(Boolean);
        await api.put('/users/me/teaching-areas', { areas: areaNumbers });
      }
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

  const handleProjectsPageChange = async (newPage: number) => {
    if (!userId) return;
    setIsLoadingProjects(true);
    try {
      const response = isOwnProfile
        ? await api.get('/projects/me', { params: { page: newPage, pageSize: 5 } })
        : await api.get(`/projects/user/${userId}`, { params: { page: newPage, pageSize: 5 } });
      setProjects(response.data?.items || []);
      setProjectsPage(newPage);
      setProjectsTotalPages(response.data?.totalPages ?? 1);
      setProjectsTotalCount(response.data?.totalCount ?? 0);
    } catch {
      setError('Não foi possível carregar os projetos.');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleCollabPageChange = async (newPage: number) => {
    if (!userId) return;
    setIsLoadingCollabs(true);
    try {
      const response = isOwnProfile
        ? await api.get('/projects/me/collaborations', { params: { page: newPage, pageSize: 5 } })
        : await api.get(`/projects/user/${userId}/collaborations`, { params: { page: newPage, pageSize: 5 } });
      setCollaboratedProjects(response.data?.items || []);
      setCollabPage(newPage);
      setCollabTotalPages(response.data?.totalPages ?? 1);
      setCollabTotalCount(response.data?.totalCount ?? 0);
    } catch {
      setError('Não foi possível carregar as colaborações.');
    } finally {
      setIsLoadingCollabs(false);
    }
  };

  return {
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
    currentUser,
    handleEditProfile,
    handleSaveProfile,
    handlePhotoUpload,
    handlePhotoCropConfirm,
  };
};
