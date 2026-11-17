import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectCategory } from '../types';
import type { ThematicArea } from '@/constants/thematicAreas';
import type { CollaboratorUser } from '@/components/UserTagInput';
import { useProjectFileUpload } from './useProjectFileUpload';
import { createProjectSubmission } from '../projectSubmission';
import type { ProjectContentBlockDraft } from '../projectContent';

export const useNewProject = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Tcc');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [thematicArea, setThematicArea] = useState<ThematicArea>('TecnologiaInovacao');
  const [tags, setTags] = useState<string[]>([]);
  const [authorContribution, setAuthorContribution] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [contentBlocks, setContentBlocks] = useState<ProjectContentBlockDraft[]>([]);
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
      const submission = createProjectSubmission({
        title,
        category,
        description,
        tags,
        authorContribution,
        authorRole,
        collaborators,
        contentBlocks,
        githubLink,
        fileUrl: fileUpload.fileUrl,
      });
      await api.post('/projects', {
        ...submission,
        summary,
        thematicArea,
        advisor,
        imageUrl: fileUpload.imageUrl,
        isPrivate,
      });
      navigate('/projects');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : '') ||
        'Não foi possível publicar o projeto.';
      setError(message);
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
    thematicArea, setThematicArea,
    tags, setTags,
    authorContribution, setAuthorContribution,
    authorRole, setAuthorRole,
    contentBlocks, setContentBlocks,
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
