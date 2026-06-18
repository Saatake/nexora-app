import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectCategory } from '../types';
import type { CollaboratorUser } from '@/components/UserTagInput';
import { useProjectFileUpload } from './useProjectFileUpload';

export const useEditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Tcc');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [course, setCourse] = useState('');
  const [area, setArea] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fileUpload = useProjectFileUpload();

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        navigate('/projects');
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get(`/projects/${id}`);
        const project = response.data;
        setTitle(project.title);
        setCategory(project.category as ProjectCategory);
        setSummary(project.summary || '');
        setDescription(project.description);
        setGithubLink(project.githubLink);
        fileUpload.setFileUrl(project.fileUrl);
        setCourse(project.course || '');
        setArea(project.area || '');
        setAdvisor(project.advisor || '');
        fileUpload.setImageUrl(project.imageUrl || '');
        setIsPrivate(project.isPrivate || false);
        if (project.imageUrl) fileUpload.setCoverPreview(project.imageUrl);
        if (project.collaborators?.length > 0) setCollaborators(project.collaborators);
      } catch {
        setError('Não foi possível carregar o projeto.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProject();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await api.put(`/projects/${id}`, {
        title,
        description,
        summary,
        course,
        area,
        advisor,
        githubLink,
        fileUrl: fileUpload.fileUrl,
        imageUrl: fileUpload.imageUrl,
        category,
        isPrivate,
        collaboratorIds: collaborators.map((c) => c.id),
      });
      navigate('/projects');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Não foi possível atualizar o projeto.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    title, setTitle,
    category, setCategory,
    summary, setSummary,
    description, setDescription,
    githubLink, setGithubLink,
    course, setCourse,
    area, setArea,
    advisor, setAdvisor,
    collaborators, setCollaborators,
    isPrivate, setIsPrivate,
    isSaving,
    error,
    currentUser,
    fileUpload,
    handleSubmit,
    navigateBack: () => navigate('/projects'),
  };
};
