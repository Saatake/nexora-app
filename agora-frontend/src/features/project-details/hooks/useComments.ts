import { useEffect, useState } from 'react';
import api from '@/api/axios';
import type { Comment } from '../types';

export const useComments = (projectId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;
    api
      .get<Comment[]>(`/projects/${projectId}/comments`)
      .then((res) => {
        if (isMounted) setComments(res.data ?? []);
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const handleAddComment = async () => {
    if (!projectId || !commentText.trim()) return;
    setIsCommenting(true);
    try {
      const response = await api.post<Comment>(
        `/projects/${projectId}/comments`,
        { text: commentText.trim() },
      );
      setComments((prev) => [...prev, response.data]);
      setCommentText('');
    } catch {
      setError('Não foi possível publicar o comentário.');
    } finally {
      setIsCommenting(false);
    }
  };

  return {
    comments,
    commentText,
    setCommentText,
    isCommenting,
    handleAddComment,
    commentError: error,
  };
};
