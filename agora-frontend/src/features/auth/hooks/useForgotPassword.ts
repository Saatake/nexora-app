import React, { useState } from 'react';
import api from '@/api/axios';
import { getErrorMessage } from '../utils/errorMessages';

export const useForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccess(
        response.data?.message || 'Se o email estiver cadastrado, enviamos as instrucoes.',
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao solicitar recuperacao de senha'));
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, error, success, loading, handleSubmit };
};
