import { useState } from 'react';
import api from '@/api/axios';
import type { AiReview, EvaluationFormData } from '../types';

const defaultFormData: EvaluationFormData = {
  relevance: 0,
  quality: 0,
  methodology: 0,
  presentation: 0,
  innovation: 0,
  feedback: '',
};

export const useEvaluation = (
  projectId: number,
  onRefresh: () => Promise<void>,
  setPageError: (msg: string) => void,
) => {
  const [evaluationData, setEvaluationData] =
    useState<EvaluationFormData>(defaultFormData);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evalError, setEvalError] = useState('');

  const [aiReview, setAiReview] = useState<AiReview | null>(null);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [showAiFeedback, setShowAiFeedback] = useState(false);

  const handleSubmitEvaluation = async () => {
    if (!projectId) return;
    const { relevance, quality, methodology, presentation, innovation } =
      evaluationData;
    if (
      [relevance, quality, methodology, presentation, innovation].some(
        (v) => v === 0,
      )
    ) {
      setEvalError('Por favor, preencha todas as notas de 1 a 10.');
      return;
    }
    setIsEvaluating(true);
    setEvalError('');
    try {
      await api.post(`/projects/${projectId}/evaluations`, evaluationData);
      await onRefresh();
      setEvaluationData(defaultFormData);
      setShowEvaluationForm(false);
    } catch (err: unknown) {
      const msg = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setEvalError(msg || 'Não foi possível enviar a avaliação.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAiReview = async () => {
    if (!projectId) return;
    setIsAiReviewing(true);
    setPageError('');
    try {
      const res = await api.post<AiReview>(`/projects/${projectId}/ai-review`);
      setAiReview(res.data);
    } catch {
      setPageError('Não foi possível gerar a avaliação com IA.');
    } finally {
      setIsAiReviewing(false);
    }
  };

  return {
    evaluationData,
    setEvaluationData,
    isEvaluating,
    showEvaluationForm,
    setShowEvaluationForm,
    evalError,
    setEvalError,
    aiReview,
    isAiReviewing,
    showAiFeedback,
    setShowAiFeedback,
    handleSubmitEvaluation,
    handleAiReview,
  };
};
