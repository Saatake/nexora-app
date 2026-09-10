import { useState, useEffect, useCallback } from 'react';
import api from '@/api/axios';
import type { Mentorship, MentorshipMessage } from '@/types/mentorship';

export const useMentorship = (projectId?: number | string) => {
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [messages, setMessages] = useState<MentorshipMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMentorship = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<Mentorship>(`/projects/${projectId}/mentorship`);
      setMentorship(res.data);
    } catch {
      // silencia
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchMessages = useCallback(async (mentorshipId: number) => {
    try {
      setIsLoadingMessages(true);
      const res = await api.get<MentorshipMessage[]>(`/mentorships/${mentorshipId}/messages`);
      setMessages(res.data);
    } catch {
      // silencia
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchMentorship();
  }, [fetchMentorship]);

  useEffect(() => {
    if (mentorship && mentorship.status === 'Active') {
      fetchMessages(mentorship.id);
      const interval = setInterval(() => fetchMessages(mentorship.id), 10000);
      return () => clearInterval(interval);
    }
  }, [mentorship, fetchMessages]);

  const requestMentorship = async (professorId?: string, message?: string): Promise<{ success: boolean; error?: string }> => {
    if (!projectId) return { success: false, error: 'Projeto inválido.' };
    try {
      const res = await api.post(`/projects/${projectId}/mentorship/request`, {
        professorId,
        message,
      });
      setMentorship(res.data);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao enviar solicitação.';
      return { success: false, error: msg };
    }
  };

  const acceptMentorship = async (mentorshipId: number) => {
    try {
      const res = await api.post(`/mentorships/${mentorshipId}/accept`);
      setMentorship(res.data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Erro ao aceitar mentoria.' };
    }
  };

  const rejectMentorship = async (mentorshipId: number) => {
    try {
      await api.post(`/mentorships/${mentorshipId}/reject`);
      setMentorship(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Erro ao recusar.' };
    }
  };

  const revokeMentorship = async (mentorshipId: number, reason?: string) => {
    try {
      await api.post(`/mentorships/${mentorshipId}/revoke`, JSON.stringify(reason || ''), {
        headers: { 'Content-Type': 'application/json' },
      });
      setMentorship(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Erro ao encerrar mentoria.' };
    }
  };

  // Metas (Goals)
  const createGoal = async (title: string, description: string, dueDate?: string): Promise<{ success: boolean; error?: string }> => {
    if (!mentorship) return { success: false, error: 'Mentoria não encontrada.' };
    try {
      const res = await api.post(`/mentorships/${mentorship.id}/goals`, {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      setMentorship((prev) =>
        prev
          ? {
              ...prev,
              totalGoals: prev.totalGoals + 1,
              goals: [...prev.goals, res.data],
            }
          : prev
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Erro ao criar meta.' };
    }
  };

  const submitGoal = async (goalId: number, note?: string) => {
    try {
      const res = await api.post(`/mentorships/goals/${goalId}/submit`, { note });
      setMentorship((prev) => {
        if (!prev) return prev;
        const updated = prev.goals.map((g) => (g.id === goalId ? res.data : g));
        return {
          ...prev,
          pendingReviewGoals: prev.pendingReviewGoals + 1,
          goals: updated,
        };
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Erro ao submeter meta.' };
    }
  };

  const reviewGoal = async (goalId: number, approved: boolean, feedback?: string) => {
    try {
      const res = await api.post(`/mentorships/goals/${goalId}/review`, {
        approved,
        feedback,
      });
      setMentorship((prev) => {
        if (!prev) return prev;
        const updated = prev.goals.map((g) => (g.id === goalId ? res.data : g));
        return {
          ...prev,
          pendingReviewGoals: Math.max(0, prev.pendingReviewGoals - 1),
          completedGoals: approved ? prev.completedGoals + 1 : prev.completedGoals,
          goals: updated,
        };
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Erro ao revisar meta.' };
    }
  };

  const deleteGoal = async (goalId: number) => {
    try {
      await api.delete(`/mentorships/goals/${goalId}`);
      setMentorship((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalGoals: Math.max(0, prev.totalGoals - 1),
          goals: prev.goals.filter((g) => g.id !== goalId),
        };
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Erro ao excluir meta.' };
    }
  };

  // Chat
  const sendMessage = async (content: string): Promise<{ success: boolean; error?: string }> => {
    if (!mentorship || !content.trim()) return { success: false, error: 'Mensagem vazia.' };
    try {
      const res = await api.post(`/mentorships/${mentorship.id}/messages`, {
        content: content.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Erro ao enviar mensagem.' };
    }
  };

  return {
    mentorship,
    messages,
    isLoading,
    isLoadingMessages,
    error,
    requestMentorship,
    acceptMentorship,
    rejectMentorship,
    revokeMentorship,
    createGoal,
    submitGoal,
    reviewGoal,
    deleteGoal,
    sendMessage,
    refresh: fetchMentorship,
  };
};
