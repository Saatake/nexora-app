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

      const [extractResult, uploadResult] = await Promise.allSettled([
        api.post<{
          title?: string;
          summary?: string;
          description?: string;
          category?: ProjectCategory;
          thematicArea?: ThematicArea;
          tags?: string[];
          advisor?: string | null;
          authorRole?: string | null;
          authorContribution?: string | null;
          githubLink?: string | null;
          contentBlocks?: Array<{
            type?: string;
            text?: string | null;
            url?: string | null;
            caption?: string | null;
            sortOrder?: number;
          }>;
        }>('/projects/extract-from-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
        fileUpload.uploadContentDocument(file),
      ]);

      if (extractResult.status === 'rejected') {
        throw extractResult.reason;
      }

      const data = extractResult.value.data;
      if (data.title) setTitle(data.title.slice(0, 200));
      if (data.summary) setSummary(data.summary.slice(0, 200));
      if (data.description) setDescription(data.description.slice(0, 5000));
      if (data.category) setCategory(data.category);
      if (data.thematicArea) setThematicArea(data.thematicArea);
      if (Array.isArray(data.tags) && data.tags.length > 0) setTags(data.tags);
      if (data.advisor) setAdvisor(data.advisor.slice(0, 120));
      if (data.authorRole) setAuthorRole(data.authorRole.slice(0, 100));
      if (data.authorContribution) setAuthorContribution(data.authorContribution.slice(0, 800));
      if (data.githubLink) setGithubLink(data.githubLink);

      const nextBlocks: ProjectContentBlockDraft[] = [];
      if (Array.isArray(data.contentBlocks)) {
        for (const item of data.contentBlocks) {
          if (item.type === 'Text' && item.text?.trim()) {
            nextBlocks.push({
              id: crypto.randomUUID(),
              type: 'Text',
              text: item.text.trim().slice(0, 5000),
              caption: item.caption?.trim().slice(0, 300) || undefined,
              sortOrder: nextBlocks.length,
            });
          } else if (item.type === 'Link' && item.url?.trim()) {
            nextBlocks.push({
              id: crypto.randomUUID(),
              type: 'Link',
              url: item.url.trim(),
              caption: item.caption?.trim().slice(0, 300) || undefined,
              sortOrder: nextBlocks.length,
            });
          }
        }
      }

      if (uploadResult.status === 'fulfilled' && uploadResult.value) {
        fileUpload.setFileUrl(uploadResult.value);
        nextBlocks.push({
          id: crypto.randomUUID(),
          type: 'Document',
          url: uploadResult.value,
          caption: file.name.slice(0, 300),
          sortOrder: nextBlocks.length,
        });
      }

      if (nextBlocks.length > 0) {
        setContentBlocks(nextBlocks.map((block, sortOrder) => ({ ...block, sortOrder })));
      }

      setExtractMessage(
        'Projeto preenchido pela IA (incluindo blocos de conteúdo e PDF anexado)! Revise os dados e adicione imagens ou membros da equipe se desejar.'
      );
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
