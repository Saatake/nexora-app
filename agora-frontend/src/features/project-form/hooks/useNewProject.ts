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
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [extractMessage, setExtractMessage] = useState('');
  const [error, setError] = useState('');

  const fileUpload = useProjectFileUpload();

  const handleExtractFromPdf = async (file: File) => {
    setError('');
    setExtractMessage('');
    setIsExtractingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{
        title?: string;
        summary?: string;
        description?: string;
        category?: ProjectCategory;
        thematicArea?: ThematicArea;
        tags?: string[];
      }>('/projects/extract-from-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response.data;
      if (data.title) setTitle(data.title.slice(0, 200));
      if (data.summary) setSummary(data.summary.slice(0, 200));
      if (data.description) setDescription(data.description.slice(0, 5000));
      if (data.category) setCategory(data.category);
      if (data.thematicArea) setThematicArea(data.thematicArea);
      if (Array.isArray(data.tags) && data.tags.length > 0) setTags(data.tags);
      setExtractMessage('Campos preenchidos pela IA! Revise os dados e adicione os membros da equipe.');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Não foi possível extrair os dados do PDF com a IA.';
      setError(message);
    } finally {
      setIsExtractingPdf(false);
    }
  };

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
    isExtractingPdf,
    extractMessage,
    handleExtractFromPdf,
    error,
    currentUser,
    fileUpload,
    handleSubmit,
  };
};
