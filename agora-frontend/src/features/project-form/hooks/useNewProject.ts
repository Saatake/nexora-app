import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectCategory } from '../types';
import type { CollaboratorUser } from '@/components/UserTagInput';
import { useProjectFileUpload } from './useProjectFileUpload';

export const useNewProject = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await api.post('/projects', {
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
    } catch {
      setError('Não foi possível publicar o projeto.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
  };
};
