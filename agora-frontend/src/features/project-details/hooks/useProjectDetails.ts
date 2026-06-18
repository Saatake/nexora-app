import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, Evaluation } from '../types';

export const useProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  const projectId = useMemo(() => Number(id), [id]);

  const canEvaluate = useMemo(() => {
    if (!user || !project) return false;
    if (project.authorId === user.id) return false;
    return !evaluations.some((e) => e.professorId === user.id);
  }, [user, project, evaluations]);

  const teamMembers = useMemo(() => {
    if (!project?.teamMembers) return [];
    return project.teamMembers.split(',').map((s) => s.trim()).filter(Boolean);
  }, [project]);

  const latestEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;
    const loadProject = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [projectResponse, evaluationResponse] = await Promise.all([
          api.get<Project>(`/projects/${projectId}`),
          api.get<Evaluation[]>(`/projects/${projectId}/evaluations`),
        ]);
        if (!isMounted) return;
        setProject(projectResponse.data);
        setEvaluations(evaluationResponse.data ?? []);

        if (!user || projectResponse.data.authorId !== user.id) {
          api.post(`/projects/${projectId}/views`).catch(() => undefined);
        }
      } catch {
        if (isMounted) setError('Não foi possível carregar o projeto.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadProject();
    return () => {
      isMounted = false;
    };
  }, [projectId, user]);

  const refreshProjectAndEvals = async () => {
    const [evalRes, projRes] = await Promise.all([
      api.get<Evaluation[]>(`/projects/${projectId}/evaluations`),
      api.get<Project>(`/projects/${projectId}`),
    ]);
    setEvaluations(evalRes.data ?? []);
    setProject(projRes.data);
  };

  const handleDownload = async () => {
    if (!projectId) return;
    setIsDownloading(true);
    try {
      const response = await api.get(`/projects/${projectId}/download`);
      const url = response.data?.fileUrl as string | undefined;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        setProject((prev) =>
          prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : prev,
        );
      }
    } catch {
      setError('Não foi possível baixar o arquivo.');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    project,
    evaluations,
    isLoading,
    isDownloading,
    error,
    setError,
    projectId,
    canEvaluate,
    teamMembers,
    latestEval,
    user,
    handleDownload,
    refreshProjectAndEvals,
  };
};
